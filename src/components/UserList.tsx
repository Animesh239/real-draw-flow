import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  color: string;
}

interface UserListProps {
  currentUserId: string;
}

const USER_COLORS = [
  "hsl(195, 100%, 50%)", // Cyan
  "hsl(280, 100%, 65%)", // Purple
  "hsl(340, 100%, 60%)", // Pink
  "hsl(120, 100%, 40%)", // Green
  "hsl(40, 100%, 50%)",  // Orange
];

export const UserList = ({ currentUserId }: UserListProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [userColorMap] = useState(new Map<string, string>());

  useEffect(() => {
    const channel = supabase.channel("user-presence");

    channel
      .on("presence", { event: "sync" }, () => {
        const presenceState = channel.presenceState();
        const activeUsers: User[] = [];

        Object.keys(presenceState).forEach((key, index) => {
          if (!userColorMap.has(key)) {
            userColorMap.set(key, USER_COLORS[index % USER_COLORS.length]);
          }
          activeUsers.push({
            id: key,
            color: userColorMap.get(key)!,
          });
        });

        setUsers(activeUsers);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: currentUserId,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  return (
    <div className="flex flex-col gap-4 p-4 bg-toolbar-bg rounded-lg border border-border">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">
          Online ({users.length})
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {users.map((user) => (
          <div
            key={user.id}
            className={cn(
              "w-8 h-8 rounded-full border-2 border-border flex items-center justify-center text-xs font-bold transition-all hover:scale-110",
              user.id === currentUserId && "ring-2 ring-primary"
            )}
            style={{ backgroundColor: user.color }}
            title={user.id === currentUserId ? "You" : `User ${user.id.slice(0, 8)}`}
          >
            {user.id === currentUserId ? "You" : user.id.slice(0, 2).toUpperCase()}
          </div>
        ))}
      </div>
    </div>
  );
};
