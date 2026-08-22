-- Validation constraints on leads
ALTER TABLE public.leads
  ADD CONSTRAINT leads_name_valid CHECK (char_length(btrim(name)) BETWEEN 2 AND 120),
  ADD CONSTRAINT leads_email_valid CHECK (char_length(email) <= 254 AND email ~* '^[A-Za-z0-9._%%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  ADD CONSTRAINT leads_phone_valid CHECK (phone IS NULL OR char_length(phone) <= 30),
  ADD CONSTRAINT leads_interest_valid CHECK (interest IS NULL OR char_length(interest) <= 120),
  ADD CONSTRAINT leads_message_valid CHECK (message IS NULL OR char_length(message) <= 2000);

-- Tighten public insert policy: no arbitrary blank/oversized payloads, no back-dating
DROP POLICY IF EXISTS "Allow public insert on leads" ON public.leads;
CREATE POLICY "Allow public insert on leads"
ON public.leads
FOR INSERT
TO anon, authenticated
WITH CHECK (
  char_length(btrim(name)) BETWEEN 2 AND 120
  AND char_length(email) <= 254
  AND email ~* '^[A-Za-z0-9._%%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND (phone IS NULL OR char_length(phone) <= 30)
  AND (interest IS NULL OR char_length(interest) <= 120)
  AND (message IS NULL OR char_length(message) <= 2000)
);

-- Leads are immutable records: explicitly deny updates (fail-closed, intentional)
REVOKE UPDATE ON public.leads FROM anon, authenticated;