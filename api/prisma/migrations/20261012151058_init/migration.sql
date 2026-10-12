-- CreateTable
CREATE TABLE "tareas" (
    "id" SERIAL NOT NULL,
    "titulo" VARCHAR(120) NOT NULL,
    "descripcion" TEXT,
    "completado" BOOLEAN NOT NULL DEFAULT false,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "adjunto_nombre" TEXT,
    "adjunto_archivo" TEXT,
    "adjunto_mime" TEXT,

    CONSTRAINT "tareas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tareas_completado_idx" ON "tareas"("completado");
