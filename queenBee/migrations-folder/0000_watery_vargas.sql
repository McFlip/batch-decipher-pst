CREATE TABLE IF NOT EXISTS "smime_cert" (
	"sha1" text PRIMARY KEY NOT NULL,
	"serial" text NOT NULL,
	"email" text NOT NULL,
	"subject" text NOT NULL,
	"upn" text NOT NULL,
	"issuer" text NOT NULL,
	"not_before" date NOT NULL,
	"not_after" date NOT NULL
);

CREATE INDEX IF NOT EXISTS "email_idx" ON "smime_cert" ("email");