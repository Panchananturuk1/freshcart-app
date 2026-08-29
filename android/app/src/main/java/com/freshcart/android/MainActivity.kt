package com.freshcart.android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.lifecycle.viewmodel.compose.viewModel
import com.freshcart.android.ui.FreshCartRoot
import com.freshcart.android.ui.FreshCartViewModel

private val Lime = Color(0xFF8BC34A)
private val Forest = Color(0xFF16351C)
private val Cream = Color(0xFFF4F1E8)
private val Leaf = Color(0xFF2E7D32)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            FreshCartTheme {
                val repository = (application as FreshCartApp).repository
                val viewModel: FreshCartViewModel = viewModel(factory = FreshCartViewModel.factory(repository))
                FreshCartRoot(viewModel)
            }
        }
    }
}

@Composable
fun FreshCartTheme(content: @Composable () -> Unit) {
    val context = LocalContext.current
    val dark = isSystemInDarkTheme()
    val dynamic = android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S
    val colors = when {
        dynamic && dark -> dynamicDarkColorScheme(context)
        dynamic && !dark -> dynamicLightColorScheme(context)
        dark -> darkColorScheme(
            primary = Lime,
            onPrimary = Forest,
            secondary = Leaf,
            background = Color(0xFF0B120C),
            surface = Color(0xFF122016),
            onBackground = Color(0xFFF4F1E8),
            onSurface = Color(0xFFF4F1E8),
            surfaceVariant = Color(0xFF1C2B20),
        )
        else -> lightColorScheme(
            primary = Leaf,
            onPrimary = Color.White,
            secondary = Forest,
            background = Color(0xFFF7F4EC),
            surface = Color.White,
            onBackground = Forest,
            onSurface = Forest,
            surfaceVariant = Cream,
            primaryContainer = Color(0xFFDCEFBE),
            tertiary = Lime,
        )
    }
    MaterialTheme(
        colorScheme = colors,
        typography = Typography(
            headlineSmall = TextStyle(fontWeight = FontWeight.Bold, fontSize = 24.sp),
            titleLarge = TextStyle(fontWeight = FontWeight.Bold, fontSize = 20.sp),
            titleMedium = TextStyle(fontWeight = FontWeight.SemiBold, fontSize = 16.sp),
        ),
        content = content,
    )
}
