import { z } from "zod";
import sharp from "sharp";

export const imageOptInputSchema = z.object({
    buffer: z.any().optional(), // Relaxed check to avoid instanceof issues
    imageUrl: z.string().optional(),
    targetFormat: z.enum(["webp", "avif", "jpeg", "png"]).default("webp"),
    quality: z.number().min(1).max(100).default(80),
    width: z.number().optional(),
    height: z.number().optional(),
}).refine(data => data.buffer || data.imageUrl, {
    message: "Either buffer or imageUrl must be provided"
});

export type ImageOptInput = z.input<typeof imageOptInputSchema>;

export const imageOptOutputSchema = z.object({
    format: z.string(),
    width: z.number(),
    height: z.number(),
    buffer: z.any(), // Relaxed output check
});

export type ImageOptOutput = z.infer<typeof imageOptOutputSchema>;

export async function optimizeImage(input: ImageOptInput): Promise<ImageOptOutput> {
    console.log("[OptimizeImage] Input Buffer Type:", input.buffer ? input.buffer.constructor.name : "undefined");
    console.log("[OptimizeImage] Input ImageUrl:", input.imageUrl);

    const validated = imageOptInputSchema.parse(input);

    let pipeline;

    if (validated.buffer) {
        // Ensure it's treated as a Buffer
        const buf = Buffer.isBuffer(validated.buffer) ? validated.buffer : Buffer.from(validated.buffer);
        console.log("[OptimizeImage] Processing Buffer. Length:", buf.length);
        pipeline = sharp(buf);
    } else if (validated.imageUrl) {
        console.log("[OptimizeImage] Processing URL/Path:", validated.imageUrl);
        pipeline = sharp(validated.imageUrl);
    } else {
        throw new Error("No valid input provided for image optimization");
    }

    // Metadata
    const metadata = await pipeline.metadata();

    // Resize if specific width/height or if too large (default max 1920)
    const maxWidth = validated.width || 1920;
    const maxHeight = validated.height || 1080;

    if ((metadata.width && metadata.width > maxWidth) || (metadata.height && metadata.height > maxHeight)) {
        pipeline = pipeline.resize({
            width: maxWidth,
            height: maxHeight,
            fit: 'inside',
            withoutEnlargement: true
        });
    }

    // Format
    if (validated.targetFormat === 'webp') {
        pipeline = pipeline.webp({ quality: validated.quality });
    } else if (validated.targetFormat === 'avif') {
        pipeline = pipeline.avif({ quality: validated.quality });
    } else if (validated.targetFormat === 'jpeg') {
        pipeline = pipeline.jpeg({ quality: validated.quality });
    } else if (validated.targetFormat === 'png') {
        pipeline = pipeline.png({ quality: validated.quality });
    }

    const outputBuffer = await pipeline.toBuffer();
    const outputMetadata = await sharp(outputBuffer).metadata();

    return {
        format: outputMetadata.format || validated.targetFormat,
        width: outputMetadata.width || 0,
        height: outputMetadata.height || 0,
        buffer: outputBuffer
    };
}
