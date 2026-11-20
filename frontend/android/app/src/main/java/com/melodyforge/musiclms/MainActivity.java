package com.melodyforge.musiclms;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Window window = getWindow();

        // Harmonize system status bar (Notification Bar) and navigation bar with MelodyForge theme
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.setStatusBarColor(Color.parseColor("#080C14"));
            window.setNavigationBarColor(Color.parseColor("#080C14"));
        }

        // Apply insets to ensure zero collision with status bar, notch cutouts, navigation bar, and keyboard
        View contentView = findViewById(android.R.id.content);
        if (contentView != null) {
            ViewCompat.setOnApplyWindowInsetsListener(contentView, (v, insets) -> {
                int top = insets.getInsets(WindowInsetsCompat.Type.statusBars() | WindowInsetsCompat.Type.displayCutout()).top;
                int bottom = insets.getInsets(WindowInsetsCompat.Type.navigationBars() | WindowInsetsCompat.Type.ime()).bottom;
                int left = insets.getInsets(WindowInsetsCompat.Type.displayCutout()).left;
                int right = insets.getInsets(WindowInsetsCompat.Type.displayCutout()).right;

                v.setPadding(left, top, right, bottom);
                return insets;
            });
        }
    }
}
