
ALTER FUNCTION public.tg_set_updated_at() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.tg_set_updated_at() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_first_user_admin() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM public, anon;
