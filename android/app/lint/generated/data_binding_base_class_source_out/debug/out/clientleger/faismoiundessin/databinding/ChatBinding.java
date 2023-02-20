// Generated by view binder compiler. Do not edit!
package clientleger.faismoiundessin.databinding;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.ListView;
import android.widget.RelativeLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.viewbinding.ViewBinding;

import clientleger.faismoiundessin.R;

public final class ChatBinding implements ViewBinding {
    @NonNull
    private final RelativeLayout rootView;

    @NonNull
    public final EditText messageBox;

    @NonNull
    public final ListView messageList;

    @NonNull
    public final TextView send;

    private ChatBinding(@NonNull RelativeLayout rootView, @NonNull EditText messageBox,
                        @NonNull ListView messageList, @NonNull TextView send) {
        this.rootView = rootView;
        this.messageBox = messageBox;
        this.messageList = messageList;
        this.send = send;
    }

    @Override
    @NonNull
    public RelativeLayout getRoot() {
        return rootView;
    }

    @NonNull
    public static ChatBinding inflate(@NonNull LayoutInflater inflater) {
        return inflate(inflater, null, false);
    }

    @NonNull
    public static ChatBinding inflate(@NonNull LayoutInflater inflater, @Nullable ViewGroup parent,
                                      boolean attachToParent) {
        View root = inflater.inflate(R.layout.chat, parent, false);
        if (attachToParent) {
            parent.addView(root);
        }
        return bind(root);
    }

    @NonNull
    public static ChatBinding bind(@NonNull View rootView) {
        // The body of this method is generated in a way you would not otherwise write.
        // This is done to optimize the compiled bytecode for size and performance.
        int id;
        missingId:
        {
            id = R.id.messageBox;
            EditText messageBox = rootView.findViewById(id);
            if (messageBox == null) {
                break missingId;
            }

            id = R.id.messageList;
            ListView messageList = rootView.findViewById(id);
            if (messageList == null) {
                break missingId;
            }

            id = R.id.chat_button;
            TextView send = rootView.findViewById(id);
            if (send == null) {
                break missingId;
            }

            return new ChatBinding((RelativeLayout) rootView, messageBox, messageList, send);
        }
        String missingId = rootView.getResources().getResourceName(id);
        throw new NullPointerException("Missing required view with ID: ".concat(missingId));
    }
}
