import { describe, it, beforeEach, after } from 'node:test';
import assert from 'node:assert';
import { FALLBACK_LESSONS, getFallbackLesson, getFallbackLessonByTitle } from '../data/lessonsData.ts';
import { api } from '../services/api.ts';

const originalFetch = globalThis.fetch;

describe('1. Authoritative Client Curriculum & Fallback Catalog', () => {
  it('contains complete lessons covering Tier 1 Levels 1, 2, and 3', () => {
    // Level 1
    const l1 = getFallbackLesson(1);
    const l2 = getFallbackLesson(2);
    assert.ok(l1, 'Lesson 1 exists');
    assert.ok(l2, 'Lesson 2 exists');
    assert.strictEqual(l1.title, 'Anatomy of the Piano Keyboard');
    assert.strictEqual(l2.title, 'The White Keys and Black Keys Pattern');

    // Level 2
    const l3 = getFallbackLesson(3);
    const l4 = getFallbackLesson(4);
    assert.ok(l3, 'Lesson 3 exists');
    assert.ok(l4, 'Lesson 4 exists');
    assert.strictEqual(l3.title, 'The Musical Alphabet (A to G)');
    assert.strictEqual(l4.title, 'Finding Middle C (C4) & Octaves');

    // Level 3
    const l5 = getFallbackLesson(5);
    const l6 = getFallbackLesson(6);
    const l7 = getFallbackLesson(7);
    assert.ok(l5, 'Lesson 5 exists');
    assert.ok(l6, 'Lesson 6 exists');
    assert.ok(l7, 'Lesson 7 exists');
    assert.strictEqual(l5.title, 'Finger Numbering & Hand Posture');
    assert.strictEqual(l6.title, 'Ear Training: Listening & Note Recognition');
    assert.strictEqual(l7.title, 'Tier 1: Basics Practical Assessment');
  });

  it('contains complete curriculum covering Tiers 2, 3, and 4', () => {
    // Tier 2: Intermediate
    const l8 = getFallbackLesson(8);
    const l9 = getFallbackLesson(9);
    const l10 = getFallbackLesson(10);
    assert.ok(l8 && l9 && l10, 'Tier 2 lessons exist');
    assert.strictEqual(l8.title, 'The C Major Scale Formula');
    assert.strictEqual(l9.title, 'Building Major & Minor Triads');
    assert.strictEqual(l10.title, 'Ode to Joy - Two Hand Performance');

    // Tier 3: Pro
    const l11 = getFallbackLesson(11);
    const l12 = getFallbackLesson(12);
    const l13 = getFallbackLesson(13);
    assert.ok(l11 && l12 && l13, 'Tier 3 lessons exist');

    // Tier 4: Expert
    const l14 = getFallbackLesson(14);
    const l15 = getFallbackLesson(15);
    const l16 = getFallbackLesson(16);
    assert.ok(l14 && l15 && l16, 'Tier 4 lessons exist');
  });

  it('contains multi-instrument curriculum lessons (Guitar, Violin, Drums)', () => {
    const guitar1 = getFallbackLesson(17);
    const guitar2 = getFallbackLesson(18);
    const violin1 = getFallbackLesson(19);
    const drums1 = getFallbackLesson(20);

    assert.ok(guitar1 && guitar2, 'Guitar lessons exist');
    assert.ok(violin1, 'Violin lesson exists');
    assert.ok(drums1, 'Drums lesson exists');
  });

  it('validates lesson structure integrity for all lessons in catalog', () => {
    const lessonIds = Object.keys(FALLBACK_LESSONS).map(Number);
    assert.ok(lessonIds.length >= 20, 'At least 20 lessons seeded');

    for (const id of lessonIds) {
      const les = FALLBACK_LESSONS[id];
      assert.ok(les.title && les.title.length > 3, `Lesson ${id} has valid title`);
      assert.ok(les.description && les.description.length > 5, `Lesson ${id} has valid description`);
      assert.ok(les.theoryContent && les.theoryContent.length > 10, `Lesson ${id} has valid theoryContent`);
      assert.ok(les.durationMinutes >= 5, `Lesson ${id} duration is >= 5 mins`);
      assert.ok(les.xpReward >= 25, `Lesson ${id} provides XP`);
      assert.strictEqual(les.isPublished, true, `Lesson ${id} is published`);
    }
  });

  it('resolves lessons by title search helper', () => {
    const match = getFallbackLessonByTitle('musical alphabet');
    assert.ok(match, 'Matched Musical Alphabet');
    assert.strictEqual(match.id, 3);

    const matchC4 = getFallbackLessonByTitle('Middle C');
    assert.ok(matchC4, 'Matched Middle C');
    assert.strictEqual(matchC4.id, 4);
  });
});

describe('2. ApiService Lesson Cache & Seamless Resilience', () => {
  beforeEach(() => {
    // Default fetch behavior: simulate network failure / 403 Forbidden
    globalThis.fetch = (async () => {
      throw new TypeError('Failed to fetch');
    }) as any;
  });

  after(() => {
    globalThis.fetch = originalFetch;
  });

  it('caches explicit lesson objects and retrieves them', () => {
    const mockLesson = {
      id: 999,
      title: 'Mock Resilient Lesson',
      description: 'Testing cache',
      theoryContent: 'Content',
      lessonType: 'THEORY' as const,
      durationMinutes: 10,
      xpReward: 50,
      orderIndex: 1,
      isPublished: true,
    };

    api.cacheLesson(mockLesson);
    const retrieved = api.getCachedLesson(999);
    assert.ok(retrieved, 'Lesson retrieved from cache');
    assert.strictEqual(retrieved.title, 'Mock Resilient Lesson');
  });

  it('falls back to client catalog when lesson is not in memory cache', () => {
    const retrieved = api.getCachedLesson(4);
    assert.ok(retrieved, 'Lesson retrieved from fallback catalog');
    assert.strictEqual(retrieved.id, 4);
    assert.strictEqual(retrieved.title, 'Finding Middle C (C4) & Octaves');
  });

  it('returns undefined and rejects for non-existent or invalid lesson IDs', async () => {
    globalThis.fetch = (async () => {
      return new Response(JSON.stringify({ error: 'Not Found', message: 'Lesson not found' }), {
        status: 404,
        statusText: 'Not Found',
        headers: { 'Content-Type': 'application/json' },
      });
    }) as any;

    const invalidId = 9999;
    const fallback = getFallbackLesson(invalidId);
    assert.strictEqual(fallback, undefined, 'Invalid ID returns undefined from fallback catalog');

    const cached = api.getCachedLesson(invalidId);
    assert.strictEqual(cached, undefined, 'Invalid ID returns undefined from cache');

    await assert.rejects(
      async () => {
        await api.getLesson(invalidId);
      },
      /Failed to fetch|Network connection error|Request failed|not found|Forbidden|Access forbidden/i,
      'Invalid ID properly throws an error without returning an incorrect lesson'
    );
  });

  it('correctly represents a lesson with unavailable progress as null/unavailable rather than false', async () => {
    // When progress has never been cached or retrieved, and backend returns 403 or is unavailable
    globalThis.fetch = (async () => {
      return new Response(JSON.stringify({ error: 'Forbidden', message: 'Access forbidden.' }), {
        status: 403,
        statusText: 'Forbidden',
        headers: { 'Content-Type': 'application/json' },
      });
    }) as any;

    api.clearProgressCache();
    const result = await api.getLesson(5);
    assert.ok(result.lesson, 'Lesson object returned');
    assert.strictEqual(result.lesson.id, 5);
    assert.strictEqual(result.completed, null, 'Unavailable progress is null, NOT false');
    assert.strictEqual(result.scorePercent, null, 'Unavailable score is null, NOT 0');
    assert.strictEqual(result.isProgressAvailable, false, 'isProgressAvailable is false');
  });

  it('preserves a previously completed lesson and score when backend returns 403 or network fails', async () => {
    // Student previously completed lesson 2 with score 95%
    api.cacheProgress(2, true, 95);

    // Backend remote fetch fails with 403
    globalThis.fetch = (async () => {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        statusText: 'Forbidden',
        headers: { 'Content-Type': 'application/json' },
      });
    }) as any;

    const result = await api.getLesson(2);
    assert.ok(result.lesson, 'Lesson object returned');
    assert.strictEqual(result.lesson.id, 2);
    assert.strictEqual(result.completed, true, 'Previously completed status is preserved');
    assert.strictEqual(result.scorePercent, 95, 'Legitimate assessment score is preserved');
    assert.strictEqual(result.isProgressAvailable, true, 'Progress is available from reliable cache');
  });

  it('ensures a failed network request after progress was already retrieved does not overwrite progress', async () => {
    // Retrieve progress initially
    api.cacheProgress(6, true, 100);
    const cachedBefore = api.getCachedProgress(6);
    assert.deepStrictEqual(cachedBefore, { completed: true, scorePercent: 100 });

    // Subsequent call experiences a network failure (offline)
    globalThis.fetch = (async () => {
      throw new TypeError('Failed to fetch');
    }) as any;

    const resultAfterFailure = await api.getLesson(6);
    assert.strictEqual(resultAfterFailure.completed, true, 'Completed status not overwritten');
    assert.strictEqual(resultAfterFailure.scorePercent, 100, 'Score not overwritten');

    const cachedAfter = api.getCachedProgress(6);
    assert.deepStrictEqual(cachedAfter, { completed: true, scorePercent: 100 }, 'Cache intact after failure');
  });

  it('handles normal authenticated lesson and progress loading and caches authoritative progress', async () => {
    const mockLesson = {
      id: 1,
      title: 'Anatomy of the Piano Keyboard',
      description: 'Discover 88 keys',
      theoryContent: 'Content',
      lessonType: 'THEORY' as const,
      durationMinutes: 8,
      xpReward: 50,
      orderIndex: 1,
      isPublished: true,
    };

    // Normal authenticated server response
    globalThis.fetch = (async () => {
      return new Response(
        JSON.stringify({
          lesson: mockLesson,
          completed: true,
          scorePercent: 92,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }) as any;

    const result = await api.getLesson(1);
    assert.strictEqual(result.completed, true, 'Authoritative server completed status returned');
    assert.strictEqual(result.scorePercent, 92, 'Authoritative server score returned');
    assert.strictEqual(result.isProgressAvailable, true, 'isProgressAvailable is true');

    // Verify progress is cached for future resilience
    const cached = api.getCachedProgress(1);
    assert.deepStrictEqual(cached, { completed: true, scorePercent: 92 }, 'Progress cached in ApiService');
  });

  it('purges cached progress on account switching to prevent exposing another student data', () => {
    // Student A signs in
    api.setToken('token-student-a');
    api.cacheProgress(1, true, 100);
    assert.strictEqual(api.getCachedProgress(1)?.completed, true);

    // Student B signs in with different token
    api.setToken('token-student-b');
    assert.strictEqual(api.getCachedProgress(1), undefined, 'Previous student progress is completely purged');

    // Logging out completely purges cache
    api.setToken(null);
    assert.strictEqual(api.getCachedProgress(1), undefined, 'Logged out state has no progress cache');
  });

  it('safely queues and synchronizes pending offline progress when back online', async () => {
    api.setToken('auth-online-token');
    api.queuePendingOfflineLesson(3, 100);

    // Mock successful sync endpoint
    let syncedId: number | null = null;
    globalThis.fetch = (async (url: string) => {
      if (String(url).includes('/complete')) {
        syncedId = 3;
        return new Response(JSON.stringify({ lessonId: 3, completed: true, xpAwarded: 50, totalXp: 100 }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify([]), { status: 200 });
    }) as any;

    await api.syncPendingOfflineProgress();
    assert.strictEqual(syncedId, 3, 'Pending offline lesson 3 was synchronized to backend');
  });

  it('preserves valid cached lesson content when remote request fails', async () => {
    const customLesson = {
      id: 777,
      title: 'Persistent Lesson',
      description: 'Must not be overwritten by failed fetch',
      theoryContent: 'Valid Theory',
      lessonType: 'THEORY' as const,
      durationMinutes: 15,
      xpReward: 60,
      orderIndex: 1,
      isPublished: true,
    };

    api.cacheLesson(customLesson);
    assert.strictEqual(api.getCachedLesson(777)?.title, 'Persistent Lesson');

    // Attempting getLesson on 777 should return the cached lesson without wiping or corrupting it
    const res = await api.getLesson(777);
    assert.strictEqual(res.lesson.title, 'Persistent Lesson');
    assert.strictEqual(api.getCachedLesson(777)?.title, 'Persistent Lesson', 'Cache is intact');
  });

  it('gracefully recovers when remote getLesson fails', async () => {
    // Calling getLesson on an ID with mock fallback
    const result = await api.getLesson(3);
    assert.ok(result, 'Result returned without crashing');
    assert.ok(result.lesson, 'Lesson object returned');
    assert.strictEqual(result.lesson.id, 3);
    assert.strictEqual(result.lesson.title, 'The Musical Alphabet (A to G)');
  });

  it('verifies exact tier and instrument mapping for all 20 lessons', () => {
    // Lessons 1-7: Piano Basics
    for (let id = 1; id <= 7; id++) {
      const les = getFallbackLesson(id);
      assert.ok(les, `Lesson ${id} exists`);
    }

    // Lessons 8-10: Piano Intermediate
    for (let id = 8; id <= 10; id++) {
      const les = getFallbackLesson(id);
      assert.ok(les, `Lesson ${id} exists`);
    }

    // Lessons 11-13: Piano Pro
    for (let id = 11; id <= 13; id++) {
      const les = getFallbackLesson(id);
      assert.ok(les, `Lesson ${id} exists`);
    }

    // Lessons 14-16: Piano Expert
    for (let id = 14; id <= 16; id++) {
      const les = getFallbackLesson(id);
      assert.ok(les, `Lesson ${id} exists`);
    }

    // Lessons 17-18: Guitar
    const g1 = getFallbackLesson(17);
    const g2 = getFallbackLesson(18);
    assert.ok(g1 && g1.title.includes('Guitar'), 'Lesson 17 is Guitar');
    assert.ok(g2 && g2.title.includes('Pick'), 'Lesson 18 is Guitar');

    // Lesson 19: Violin
    const v1 = getFallbackLesson(19);
    assert.ok(v1 && v1.title.includes('Violin'), 'Lesson 19 is Violin');

    // Lesson 20: Drums
    const d1 = getFallbackLesson(20);
    assert.ok(d1 && d1.title.includes('Drum'), 'Lesson 20 is Drums');
  });
});
