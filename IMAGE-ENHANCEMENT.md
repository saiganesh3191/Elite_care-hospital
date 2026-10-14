# Doctor portrait enhancement

Tool: built-in image_gen (edit mode), 14 October 2026.
Source: CARE Hospitals official portrait, retained in `public/images/dr-faizan-official.png`.
Final web asset: `public/images/dr-faizan-enhanced.webp`, 1024 x 1536 with alpha transparency.
The web asset is an optimized encoding of the generated result. The unedited supplied portrait is retained in `public/images/profile.png`.

## Exact prompt

Use case: identity-preserve. Asset: high resolution doctor portrait cutout for an existing medical website. Enhance and upscale THIS EXACT official photograph of Dr. Faizan Aziz. Preserve his facial identity, age, skin tone, face proportions, expression, hairline, beard, glasses, crossed-arm pose, white coat, shirt and stethoscope exactly as in the reference. Restore natural sharpness and reduce low-resolution pixelation, without beautification, changing facial features, adding accessories, or altering his clothing. Retain the original head-to-waist framing, with the head fully visible. Remove only the flat gray background and produce true transparent alpha around the person. Crisp natural photographic detail, no illustration, no text, no watermark, no aggressive sharpening halos, no plastic skin. Output a large portrait suitable for display at 500 CSS pixels on a high density screen, at least 1024 pixels high if supported.

## Limit

This is an AI-enhanced derivative of a small official image. The prompt requests identity preservation, but generated fine details are not the same as recovered original camera detail. An original high-resolution photograph remains the preferred replacement when available.
