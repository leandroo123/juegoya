import { z } from 'zod'

// Profile validation
export const profileSchema = z.object({
  first_name: z.string().min(1, 'El nombre es obligatorio').max(50),
  last_name: z.string().min(1, 'El apellido es obligatorio').max(50),
  whatsapp: z
    .string()
    .min(1, 'El WhatsApp es obligatorio')
    .regex(/^[\+\d\s\-()]+$/, 'Solo números, espacios, guiones o paréntesis')
    .transform((val) => val.replace(/\D/g, '')) // Remove ALL non-numeric characters including +
    .refine((val) => val.length >= 9 && val.length <= 15, 'Debe tener entre 9 y 15 dígitos'),
  zone: z.string().max(100).optional().nullable(),
  level: z.number().int().min(1).max(5).optional().nullable(), // Fútbol 5 default
  sports: z.array(z.string()).optional().nullable(),
  padel_category: z.string().optional().nullable(),
  tennis_level: z.number().int().min(1).max(5).optional().nullable(),
}).superRefine((data, ctx) => {
  // Validaciones condicionales por deporte
  if (data.sports) {
    // Pádel
    if (data.sports.includes('Pádel') && !data.padel_category) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La categoría de Pádel es obligatoria si seleccionaste Pádel',
        path: ['padel_category'],
      })
    }
    // Tenis
    if (data.sports.includes('Tenis') && !data.tennis_level) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El nivel de Tenis es obligatorio si seleccionaste Tenis',
        path: ['tennis_level'],
      })
    }
    // Fútbol 5
    if (data.sports.includes('Fútbol 5') && !data.level) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El nivel de Fútbol 5 es obligatorio si seleccionaste Fútbol 5',
        path: ['level'],
      })
    }
  }
})

export type ProfileFormData = z.infer<typeof profileSchema>

// Match creation validation
const SPORT_OPTIONS = ['Fútbol 5', 'Pádel', 'Tenis'] as const

export const createMatchSchema = z.object({
  sport: z.enum(SPORT_OPTIONS, { message: 'Deporte inválido' }),
  starts_at: z.string().refine((val) => {
    // Validar formato ISO simplificado
    const date = new Date(val)
    if (isNaN(date.getTime())) return false
    
    const now = new Date()
    const maxDate = new Date()
    maxDate.setDate(now.getDate() + 21) // 3 semanas máximo

    // Fecha futura y dentro del rango
    if (date <= now) return false
    if (date > maxDate) return false

    // Validar minutos 00 o 30
    const minutes = date.getMinutes()
    if (minutes !== 0 && minutes !== 30) return false

    return true
  }, 'La fecha debe ser futura (máx 21 días) y en horarios redondos (:00 o :30)'),
  zone: z.string().min(1, 'La zona es obligatoria').max(100),
  location_text: z.string().min(1, 'La ubicación es obligatoria').max(200),
  total_slots: z.number().int().min(1, 'Debe haber al menos 1 cupo').max(100, 'Máximo 100 cupos'),
  price_per_person: z.number().nonnegative().optional(),
  padel_level: z.string().optional().nullable(),
}).superRefine((data, ctx) => {
  if (data.sport === 'Pádel' && !data.padel_level) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'El nivel de pádel es obligatorio para partidos de Pádel',
      path: ['padel_level'],
    })
  }
})

export type CreateMatchFormData = z.infer<typeof createMatchSchema>

// Login validation
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
})

export type LoginFormData = z.infer<typeof loginSchema>
