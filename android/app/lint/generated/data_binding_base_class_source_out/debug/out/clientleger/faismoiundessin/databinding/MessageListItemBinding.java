// Generated by view binder compiler. Do not edit!
package clientleger.faismoiundessin.databinding;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.RelativeLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.viewbinding.ViewBinding;

import clientleger.faismoiundessin.R;

public final class MessageListItemBinding implements ViewBinding {
    @NonNull
    private final RelativeLayout rootView;

    @NonNull
    public final TextView receivedMessage;

    @NonNull
    public final TextView receivedUsername;

    @NonNull
    public final TextView sentMessage;

    @NonNull
    public final TextView sentUsername;

    private MessageListItemBinding(@NonNull RelativeLayout rootView,
                                   @NonNull TextView receivedMessage, @NonNull TextView receivedUsername,
                                   @NonNull TextView sentMessage, @NonNull TextView sentUsername) {
        this.rootView = rootView;
        this.receivedMessage = receivedMessage;
        this.receivedUsername = receivedUsername;
        this.sentMessage = sentMessage;
        this.sentUsername = sentUsername;
    }

    @Override
    @NonNull
    public RelativeLayout getRoot() {
        return rootView;
    }

    @NonNull
    public static MessageListItemBinding inflate(@NonNull LayoutInflater inflater) {
        return inflate(inflater, null, false);
    }

    @NonNull
    public static MessageListItemBinding inflate(@NonNull LayoutInflater inflater,
                                                 @Nullable ViewGroup parent, boolean attachToParent) {
        View root = inflater.inflate(R.layout.message_list_item, parent, false);
        if (attachToParent) {
            parent.addView(root);
        }
        return bind(root);
    }

    @NonNull
    public static MessageListItemBinding bind(@NonNull View rootView) {
        // The body of this method is generated in a way you would not otherwise write.
        // This is done to optimize the compiled bytecode for size and performance.
        int id;
        missingId:
        {
            id = R.id.receivedMessage;
            TextView receivedMessage = rootView.findViewById(id);
            if (receivedMessage == null) {
                break missingId;
            }

            id = R.id.receivedUsername;
            TextView receivedUsername = rootView.findViewById(id);
            if (receivedUsername == null) {
                break missingId;
            }

            id = R.id.sentMessage;
            TextView sentMessage = rootView.findViewById(id);
            if (sentMessage == null) {
                break missingId;
            }

            id = R.id.sentUsername;
            TextView sentUsername = rootView.findViewById(id);
            if (sentUsername == null) {
                break missingId;
            }

            return new MessageListItemBinding((RelativeLayout) rootView, receivedMessage,
                    receivedUsername, sentMessage, sentUsername);
        }
        String missingId = rootView.getResources().getResourceName(id);
        throw new NullPointerException("Missing required view with ID: ".concat(missingId));
    }
}
