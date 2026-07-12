import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const insurers = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "./src/data/insurers" }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    website: z.string().url(),
    founded: z.number().optional(),
    dgsfp_key: z.string().optional(),
    logo: z.string().optional(),
  }),
});

const products = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "./src/data/products" }),
  schema: z.object({
    name: z.string(),
    insurer: z.string(),
    modality: z.enum(["cuadro_medico", "reembolso", "mixto"]),
    copago: z.enum(["sin_copago", "con_copago", "opcional"]),
    price_from_eur: z.number(),
    price_profile: z.string(),
    hospitalization: z.boolean(),
    dental_included: z.boolean(),
    carencias: z.array(z.object({
      treatment: z.string(),
      months: z.number(),
    })),
    age_limit_new_clients: z.number().nullable(),
    telemedicine: z.boolean(),
    source_url: z.string().url(),
    last_verified: z.string(),
    notes: z.string().optional(),
  }),
});

export const collections = { insurers, products };