-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_records" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "energy" INTEGER,
    "focus" INTEGER,
    "body_fatigue" INTEGER,
    "morning_spirit" INTEGER,
    "mood" TEXT,
    "high_point" TEXT,
    "low_point" TEXT,

    CONSTRAINT "daily_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sleep_records" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "sleep_start" TIMESTAMP(3) NOT NULL,
    "sleep_end" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "duration_minutes" INTEGER,

    CONSTRAINT "sleep_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coffee_records" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "amount_ml" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coffee_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_records" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "feeling" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "physiology_records" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "is_period" BOOLEAN NOT NULL,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "day_status" TEXT,
    "mood_state" TEXT,
    "pain_level" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "physiology_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sex_records" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "occurred" BOOLEAN NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "satisfaction" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sex_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dream_records" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "had_dream" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dream_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_records" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "duration_minutes" INTEGER,

    CONSTRAINT "work_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location_records" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "location_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weather_records" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "temperature" DOUBLE PRECISION,
    "condition" TEXT,
    "humidity" DOUBLE PRECISION,
    "rainfall" DOUBLE PRECISION,
    "is_manual" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weather_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_records" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_records" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,
    "is_important" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "variables" TEXT NOT NULL,
    "metrics" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "conclusion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experiments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiment_observations" (
    "id" TEXT NOT NULL,
    "experiment_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "data" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experiment_observations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "screen_time_records" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "total_minutes" INTEGER,
    "source" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "screen_time_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_conversations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tool_calls" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "daily_records_user_id_idx" ON "daily_records"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_records_user_id_date_key" ON "daily_records"("user_id", "date");

-- CreateIndex
CREATE INDEX "sleep_records_user_id_idx" ON "sleep_records"("user_id");

-- CreateIndex
CREATE INDEX "sleep_records_user_id_date_idx" ON "sleep_records"("user_id", "date");

-- CreateIndex
CREATE INDEX "coffee_records_user_id_idx" ON "coffee_records"("user_id");

-- CreateIndex
CREATE INDEX "coffee_records_user_id_time_idx" ON "coffee_records"("user_id", "time");

-- CreateIndex
CREATE INDEX "social_records_user_id_idx" ON "social_records"("user_id");

-- CreateIndex
CREATE INDEX "social_records_user_id_start_time_idx" ON "social_records"("user_id", "start_time");

-- CreateIndex
CREATE INDEX "physiology_records_user_id_idx" ON "physiology_records"("user_id");

-- CreateIndex
CREATE INDEX "sex_records_user_id_idx" ON "sex_records"("user_id");

-- CreateIndex
CREATE INDEX "dream_records_user_id_idx" ON "dream_records"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "dream_records_user_id_date_key" ON "dream_records"("user_id", "date");

-- CreateIndex
CREATE INDEX "work_records_user_id_idx" ON "work_records"("user_id");

-- CreateIndex
CREATE INDEX "work_records_user_id_start_time_idx" ON "work_records"("user_id", "start_time");

-- CreateIndex
CREATE INDEX "location_records_user_id_idx" ON "location_records"("user_id");

-- CreateIndex
CREATE INDEX "weather_records_user_id_idx" ON "weather_records"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "weather_records_user_id_date_key" ON "weather_records"("user_id", "date");

-- CreateIndex
CREATE INDEX "content_records_user_id_idx" ON "content_records"("user_id");

-- CreateIndex
CREATE INDEX "event_records_user_id_idx" ON "event_records"("user_id");

-- CreateIndex
CREATE INDEX "preferences_user_id_idx" ON "preferences"("user_id");

-- CreateIndex
CREATE INDEX "preferences_user_id_category_idx" ON "preferences"("user_id", "category");

-- CreateIndex
CREATE INDEX "experiments_user_id_idx" ON "experiments"("user_id");

-- CreateIndex
CREATE INDEX "experiment_observations_experiment_id_idx" ON "experiment_observations"("experiment_id");

-- CreateIndex
CREATE INDEX "screen_time_records_user_id_idx" ON "screen_time_records"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "screen_time_records_user_id_date_key" ON "screen_time_records"("user_id", "date");

-- CreateIndex
CREATE INDEX "ai_conversations_user_id_idx" ON "ai_conversations"("user_id");

-- CreateIndex
CREATE INDEX "ai_messages_conversation_id_idx" ON "ai_messages"("conversation_id");

-- AddForeignKey
ALTER TABLE "daily_records" ADD CONSTRAINT "daily_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sleep_records" ADD CONSTRAINT "sleep_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coffee_records" ADD CONSTRAINT "coffee_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_records" ADD CONSTRAINT "social_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "physiology_records" ADD CONSTRAINT "physiology_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sex_records" ADD CONSTRAINT "sex_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dream_records" ADD CONSTRAINT "dream_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_records" ADD CONSTRAINT "work_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_records" ADD CONSTRAINT "location_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weather_records" ADD CONSTRAINT "weather_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_records" ADD CONSTRAINT "content_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_records" ADD CONSTRAINT "event_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preferences" ADD CONSTRAINT "preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiments" ADD CONSTRAINT "experiments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiment_observations" ADD CONSTRAINT "experiment_observations_experiment_id_fkey" FOREIGN KEY ("experiment_id") REFERENCES "experiments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screen_time_records" ADD CONSTRAINT "screen_time_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "ai_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
