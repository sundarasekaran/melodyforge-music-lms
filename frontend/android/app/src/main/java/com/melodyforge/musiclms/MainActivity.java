package com.melodyforge.musiclms;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Window window = getWindow();

        // Ensure single source of truth for insets handling
        WindowCompat.setDecorFitsSystemWindows(window, false);

        // Harmonize system status bar (Notification Bar) and navigation bar with MelodyForge theme
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.setStatusBarColor(Color.parseColor("#080C14"));
            window.setNavigationBarColor(Color.parseColor("#080C14"));
        }

        // Apply insets to ensure zero collision with status bar, notch cutouts, and navigation bar.
        // NOTE: With android:windowSoftInputMode="adjustResize", Android already resizes the Activity
        // window above the software keyboard (IME). We must NOT add keyboard height to bottom padding,
        // because that would double-pad and create a massive empty void above the keyboard.
        // When IME is open (imeHeight > 0), bottom padding is set to 0.
        // When IME is closed (imeHeight == 0), bottom padding clears the system navigation/gesture bar.
        View contentView = findViewById(android.R.id.content);
        if (contentView != null) {
            ViewCompat.setOnApplyWindowInsetsListener(contentView, (v, insets) -> {
                int top = insets.getInsets(WindowInsetsCompat.Type.statusBars() | WindowInsetsCompat.Type.displayCutout()).top;
                int left = insets.getInsets(WindowInsetsCompat.Type.displayCutout()).left;
                int right = insets.getInsets(WindowInsetsCompat.Type.displayCutout()).right;

                int imeHeight = insets.getInsets(WindowInsetsCompat.Type.ime()).bottom;
                int navBottom = insets.getInsets(WindowInsetsCompat.Type.navigationBars()).bottom;
                int bottom = (imeHeight > 0) ? 0 : navBottom;

                v.setPadding(left, top, right, bottom);
                return insets;
            });
        }
    }
}
