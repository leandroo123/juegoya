import { z } from 'zod'

// Profile validation
export const profileSchema = z.object({
  first_name: z.string().min(1, 'El nombre es obligatorio').max(50),
  last_name: z.string().min(1, 'El apellido es obligatorio').max(50),
  whatsapp: z
    .string()
    .min(1, 'El WhatsApp es obligatorio')
    .regex(/^[\+\d\s\-()]+$/, 'Solo números, espacios, guiones o paréntesis')
    .transform((val) => val.replace(/[\s\-()]/g, '')) // Normalizar: solo números
    .refine((val) => val.length >= 9 && val.length <= 15, 'Debe tener entre 9 y 15 dígitos'),
  zone: z.string().max(100).optional().nullable(),
  level: z.number().int().min(1).max(5).optional().nullable(),
  sports: z.array(z.string()).optional().nullable(),
  padel_level: z.number().int().min(1).max(5).optional().nullable(),
}).refine(
  (data) => {
    // Si sports incluye "Pádel", padel_level es obligatorio
    if (data.sports && data.sports.includes('Pádel')) {
      return data.padel_level !== null && data.padel_level !== undefined
    }
    return true
  },
  {
    message: 'El nivel de Pádel es obligatorio si seleccionaste Pádel',
    path: ['padel_level'],
  }
)

export type ProfileFormData = z.infer<typeof profileSchema>

// Match creation validation
export const createMatchSchema = z.object({
  sport: z.string().min(1, 'El deporte es obligatorio').max(50),
  starts_at: z.string().refine((val) => {
    const date = new Date(val)
    return date > new Date()
  }, 'La fecha debe ser en el futuro'),
  zone: z.string().min(1, 'La zona es obligatoria').max(100),
  location_text: z.string().min(1, 'La ubicación es obligatoria').max(200),
  total_slots: z.number().int().min(1, 'Debe haber al menos 1 cupo').max(100, 'Máximo 100 cupos'),
  price_per_person: z.number().nonnegative().optional(),
})

export type CreateMatchFormData = z.infer<typeof createMatchSchema>

// Login validation
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
})

export type LoginFormData = z.infer<typeof loginSchema>
