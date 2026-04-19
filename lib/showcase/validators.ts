import { z } from "zod";

export const WebhookBodySchema = z.object({
  discord_message_id: z.string().min(1),
  source_channel: z.string().min(1),
  author: z.object({
    discord_id: z.string().min(1),
    username: z.string().min(1),
    display_name: z.string().nullable().optional(),
    avatar_url: z.string().url().nullable().optional(),
  }),
  project: z.object({
    title: z.string().min(1).max(80),
    description: z.string().min(1).max(500),
    body: z.string().max(1200).nullable().optional(),
    tagline: z.string().max(140).nullable().optional(),
    tech_stack: z.array(z.string().max(40)).max(12).default([]),
    url: z.string().url().nullable().optional(),
    repo_url: z.string().url().nullable().optional(),
    screenshot_url: z.string().url().nullable().optional(),
    hero_image_url: z.string().url().nullable().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

export type WebhookBody = z.infer<typeof WebhookBodySchema>;

export const ApproveSchema = z.object({
  id: z.string().uuid(),
  screenshot_url: z.string().url().nullable().optional(),
  hero_image_url: z.string().url().nullable().optional(),
  url: z.string().url().nullable().optional(),
  repo_url: z.string().url().nullable().optional(),
  tagline: z.string().max(140).nullable().optional(),
  body: z.string().max(1200).nullable().optional(),
  tech_stack: z.array(z.string().max(40)).max(12).optional(),
  tag_slugs: z.array(z.string().max(40)).max(20).optional(),
  featured: z.boolean().optional(),
  featured_order: z.number().int().nullable().optional(),
});

export const RejectSchema = z.object({
  id: z.string().uuid(),
});
