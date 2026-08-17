package space.manus.minhas.diarias.app.t20260210200658;

import android.os.Build;
import android.os.Bundle;
import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;
import expo.modules.ReactActivityDelegateWrapper;
import expo.modules.splashscreen.SplashScreenManager;
import kotlin.Metadata;

/* JADX INFO: compiled from: MainActivity.kt */
/* JADX INFO: loaded from: classes4.dex */
@Metadata(d1 = {"\u0000&\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0010\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u000e\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\u0018\u00002\u00020\u0001B\u0007¢\u0006\u0004\b\u0002\u0010\u0003J\u0012\u0010\u0004\u001a\u00020\u00052\b\u0010\u0006\u001a\u0004\u0018\u00010\u0007H\u0014J\b\u0010\b\u001a\u00020\tH\u0014J\b\u0010\n\u001a\u00020\u000bH\u0014J\b\u0010\f\u001a\u00020\u0005H\u0016¨\u0006\r"}, d2 = {"Lspace/manus/minhas/diarias/app/t20260210200658/MainActivity;", "Lcom/facebook/react/ReactActivity;", "<init>", "()V", "onCreate", "", "savedInstanceState", "Landroid/os/Bundle;", "getMainComponentName", "", "createReactActivityDelegate", "Lcom/facebook/react/ReactActivityDelegate;", "invokeDefaultOnBackPressed", "app_release"}, k = 1, mv = {2, 1, 0}, xi = 48)
public final class MainActivity extends ReactActivity {
    @Override // com.facebook.react.ReactActivity, androidx.fragment.app.FragmentActivity, androidx.activity.ComponentActivity, androidx.core.app.ComponentActivity, android.app.Activity
    protected void onCreate(Bundle savedInstanceState) {
        SplashScreenManager.INSTANCE.registerOnActivity(this);
        super.onCreate(null);
    }

    @Override // com.facebook.react.ReactActivity
    protected String getMainComponentName() {
        return "main";
    }

    @Override // com.facebook.react.ReactActivity
    protected ReactActivityDelegate createReactActivityDelegate() {
        return new ReactActivityDelegateWrapper(this, true, new DefaultReactActivityDelegate(this, getMainComponentName(), DefaultNewArchitectureEntryPoint.getFabricEnabled()) { // from class: space.manus.minhas.diarias.app.t20260210200658.MainActivity.createReactActivityDelegate.1
            {
                MainActivity mainActivity = this;
            }
        });
    }

    @Override // com.facebook.react.ReactActivity, com.facebook.react.modules.core.DefaultHardwareBackBtnHandler
    public void invokeDefaultOnBackPressed() {
        if (Build.VERSION.SDK_INT <= 30) {
            if (moveTaskToBack(false)) {
                return;
            }
            super.invokeDefaultOnBackPressed();
            return;
        }
        super.invokeDefaultOnBackPressed();
    }
}
