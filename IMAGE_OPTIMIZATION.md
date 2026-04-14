# Image Optimization Guide - Haven Design & Build

## Current Image Issues & Solutions

### 🖼️ Current Images

| Image | Type | Size | Issue | Recommendation |
|-------|------|------|-------|-----------------|
| Hero (Unsplash) | JPG | ~80KB | External URL, no alt | Replace with local compressed version |
| Kitchen Remodel | JPG | Local | Good | Verify compression |
| Luxury Bathroom | PNG | Local | Larger format | Convert to WebP + JPG fallback |
| Basement Finishing | JPG | Local | Good | Verify compression |
| Outdoor Living | JPG | Local | Good | Verify compression |
| Modern Living | JPG | Local | Good | Verify compression |
| Logo | PNG | Local | Transparent OK | Consider SVG version |

---

## 🚀 Optimization Steps

### 1. **Image Format Strategy**
```
Modern browsers support:
- WebP (best compression, 25-35% smaller)
- JPG (good for photos)
- PNG (for transparent/graphics)
- SVG (for logos/icons)

Recommended approach: WebP + JPG fallback
```

### 2. **Responsive Images**
Update `<img>` tags with srcset for device optimization:
```html
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="descriptive text" loading="lazy">
</picture>
```

### 3. **Lazy Loading**
Add `loading="lazy"` to images below the fold:
```html
<img src="image.jpg" alt="caption" loading="lazy">
```

### 4. **Size Guidelines**

#### Hero Image
- Desktop: 1200x800px
- Mobile: 600x400px
- Format: WebP (30-40KB) + JPG (50-60KB)
- Ratio: 3:2

#### Project Cards
- Recommended: 400x300px (600x450px @2x)
- Format: WebP (20-25KB) + JPG (30-40KB)
- Ratio: 4:3

#### Logo
- Include both PNG (transparent) and SVG
- SVG for web (scales perfectly)
- PNG as fallback (200x200px min)

---

## 🛠️ Tools for Optimization

### Free Compression Tools
1. **TinyPNG/TinyJPG** - https://tinypng.com/ (Smart compression)
2. **ImageMagick** - Command line batch processing
3. **FFmpeg** - Convert and optimize in bulk
4. **Squoosh** - Google's web-based optimizer

### Batch Commands (Linux/Mac):

```bash
# Convert JPG to WebP (50% size reduction typical)
for file in *.jpg; do 
  cwebp "$file" -o "${file%.jpg}.webp" -q 85
done

# Compress JPG files
for file in *.jpg; do
  convert "$file" -quality 85 -strip "${file%.jpg}_optimized.jpg"
done

# Compress PNG files
for file in *.png; do
  pngquant 256 "$file" --output "${file%.png}_optimized.png"
done
```

---

## 📊 Expected Improvements

| Action | Size Reduction | Impact |
|--------|---|---|
| Convert to WebP | -35% | Faster load times |
| Remove metadata | -5-10% | Faster transfer |
| Compress JPG to 85% | -40-50% | Still high quality |
| Lazy load images | N/A | Faster initial page load |
| Responsive sizing | -30-50% | Mobile optimization |
| **Combined** | **~70%** | **Huge speed improvement** |

---

## 📝 Alt Text Strategy

### Current State
- ✅ Most images have basic alt text
- ⚠️ Can be more descriptive for SEO

### SEO-Optimized Alt Text

| Image | Current Alt | Improved Alt |
|-------|-------------|--------------|
| Kitchen | "Modern Kitchen Remodel" | "Modern luxury open-concept kitchen with custom cabinetry and stainless steel appliances" |
| Bathroom | "Luxury Bathroom" | "Spa-inspired master bathroom with marble tile, heated floors, and rainfall showerhead" |
| Outdoor | "Outdoor Patio Seating Area" | "Custom outdoor living patio with comfortable seating area and integrated landscape design" |

**Rule**: 125 characters max, descriptive but natural-sounding

---

## 🎯 Image SEO Checklist

- [ ] All images have descriptive alt text (125 char max)
- [ ] JPGs are compressed to 85% quality or better
- [ ] PNGs are compressed with pngquant or similar
- [ ] WebP versions created for modern browsers
- [ ] Hero images are no larger than 100KB (WebP) / 150KB (JPG)
- [ ] Project card images are no larger than 40KB (WebP) / 60KB (JPG)
- [ ] Images are correctly sized (not scaled in HTML)
- [ ] Lazy loading enabled for below-fold images
- [ ] Image file names are descriptive (kitchen-remodel-open-concept.jpg, not img001.jpg)
- [ ] Logo available in SVG and PNG formats

---

## 🔄 Implementation Steps

### Quick Win (15 minutes)
1. Download current JPGs/PNGs
2. Compress with TinyPNG (free tier)
3. If >50KB, reduce dimensions
4. Re-upload optimized versions

### Medium (1-2 hours)
1. Install ImageMagick or use batch tool online
2. Create WebP versions of all images
3. Update img tags with picture element + srcset
4. Add lazy loading to below-fold images

### Advanced (3-4 hours)
1. Implement full responsive image strategy
2. Create multiple sizes (400px, 800px, 1200px)
3. Set up image optimization in build process
4. Monitor image performance in Google Analytics

---

## 📊 Performance Metrics to Track

Use Google PageSpeed Insights to measure:
```
Before: Run baseline
After (each optimization):
- Largest Contentful Paint (LCP) - Target: <2.5s
- Cumulative Layout Shift (CLS) - Target: <0.1
- First Input Delay (FID) - Target: <100ms
```

---

## 💡 Pro Tips

1. **Save original files** - Keep uncompressed originals for future edits
2. **Use descriptive names** - kitchen-remodel-2026.jpg not image1.jpg
3. **Monitor file sizes** - Use Web Inspector (F12) to check actual served sizes
4. **Test mobile** - Images should load quickly on 4G
5. **Update regularly** - New project photos? Optimize before uploading

---

## 🔗 Quick Reference Commands

```bash
# Check image dimensions
identify image.jpg

# Batch resize
mogrify -resize 1200x800 *.jpg

# Convert and compress
cwebp -q 85 image.jpg -o image.webp

# Check file sizes
du -sh *.jpg *.png *.webp
```

---

## 📞 When to Consult Expert

- ✅ You can: Compress, resize, format conversion
- ❌ You might need help: AI image upscaling, complex optimizations, CDN setup

---

**Status**: Image optimization guide complete. Implement these steps to reduce load times by 50-70% and improve rankings.

Last Updated: April 14, 2026
