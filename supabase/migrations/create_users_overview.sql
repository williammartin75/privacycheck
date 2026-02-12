-- Vue "users_overview" : voir tous les utilisateurs avec leur tier et statut d'abonnement
-- À exécuter dans le SQL Editor Supabase : https://supabase.com/dashboard/project/wmgshuovszfboyofdtoy/sql/new

CREATE OR REPLACE VIEW public.users_overview AS
SELECT
    u.id AS user_id,
    u.email,
    u.created_at AS signed_up,
    u.last_sign_in_at,
    COALESCE(s.tier, 'free') AS tier,
    COALESCE(s.status, 'none') AS subscription_status,
    s.stripe_customer_id,
    s.updated_at AS subscription_updated,
    (SELECT COUNT(*) FROM public.scans sc WHERE sc.user_id = u.id) AS total_scans
FROM auth.users u
LEFT JOIN public.subscriptions s ON s.user_id = u.id
ORDER BY u.created_at DESC;

-- Autoriser la lecture (optionnel, pour l'API)
GRANT SELECT ON public.users_overview TO authenticated;
GRANT SELECT ON public.users_overview TO service_role;
