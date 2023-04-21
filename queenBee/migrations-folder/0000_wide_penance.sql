CREATE TABLE IF NOT EXISTS "smime_cert" (
	"sha1" text PRIMARY KEY NOT NULL,
	"issuer" text,
	"valid_from" date,
	"valid_to" date,
	"subject" text,
	"email" text
);
