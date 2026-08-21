# Holding imagery

Web-ready derivatives of `Supplied Files/Holding Images` (12 sources, 44MB).
**Placeholders** — replaced by real case-study photography before launch.

Three sizes, because three different jobs:

| Prefix    | Size      | Used by                                  |
|-----------|-----------|------------------------------------------|
| `arch-`   | 900×1125  | Hero arch — **portrait 4:5**             |
| `img-`    | 1600×1067 | Work cards, banners — landscape 3:2      |
| `avatar-` | 160×160   | Testimonial avatars — square             |

⚠️ The arch crops are portrait on purpose. Its tall card is 380×480, and letting
`object-cover` squeeze a 3:2 landscape into 4:5 throws away most of the frame and
crops through the middle of the subject. Cropping at export keeps the pixels.

WebP at q80. 44MB → 4.3MB across 23 files.

Regenerate with the script in the D8 session, or any equivalent — the only rules
that matter are the three aspect ratios above and keeping the longest edge at 2x
the largest displayed box.
