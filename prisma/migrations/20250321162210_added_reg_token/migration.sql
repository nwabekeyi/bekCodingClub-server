-- CreateTable
CREATE TABLE "RegistrationTokens" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "RegistrationTokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RegistrationTokens_token_key" ON "RegistrationTokens"("token");
