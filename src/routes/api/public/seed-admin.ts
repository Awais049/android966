import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/seed-admin")({
  server: {
    handlers: {
      GET: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const email = "admin@android966.com";
        const password = "A966#SecureAdmin!2026";

        const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
          page: 1,
          perPage: 200,
        });
        if (listErr) return new Response(listErr.message, { status: 500 });
        let user = list.users.find((u) => u.email?.toLowerCase() === email);

        if (!user) {
          const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: "Android 966 Admin" },
          });
          if (error) return new Response(error.message, { status: 500 });
          user = data.user!;
        } else {
          await supabaseAdmin.auth.admin.updateUserById(user.id, {
            password,
            email_confirm: true,
          });
        }

        const { error: roleErr } = await supabaseAdmin
          .from("user_roles")
          .upsert({ user_id: user.id, role: "admin" }, { onConflict: "user_id,role" });
        if (roleErr) return new Response(roleErr.message, { status: 500 });

        return Response.json({ ok: true, email });
      },
    },
  },
});
