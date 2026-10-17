import { describe, it, expect } from "vitest";
import manifest from "../src/app/manifest";
import fs from "node:fs";
import path from "node:path";

describe("PWA Manifest & Google Play TWA Assets", () => {
  it("provides valid Web App Manifest data for Google Play and Android", () => {
    const data = manifest();

    expect(data.name).toContain("كتاب قصتنا");
    expect(data.name).toContain("کتێبی چیرۆکمان");
    expect(data.name).toContain("Our Story Book");
    expect(data.short_name).toBe("Our Story Book");
    expect(data.start_url).toBe("/");
    expect(data.display).toBe("standalone");
    expect(data.theme_color).toBe("#7C2D37");
    expect(data.background_color).toBe("#FAF7F2");
    expect(data.dir).toBe("rtl");

    expect(data.icons).toBeDefined();
    expect(data.icons!.length).toBeGreaterThanOrEqual(3);

    const sizes = data.icons!.map((icon) => icon.sizes);
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");
  });

  it("ensures all referenced icons exist on the filesystem", () => {
    const data = manifest();
    const publicDir = path.join(process.cwd(), "public");

    for (const icon of data.icons || []) {
      // icon.src is like /icons/icon-192.png
      const iconPath = path.join(publicDir, icon.src.replace(/^\//, ""));
      expect(fs.existsSync(iconPath), `Missing icon file at ${iconPath}`).toBe(true);
      const stat = fs.statSync(iconPath);
      expect(stat.size).toBeGreaterThan(0);
    }
  });

  it("ensures assetlinks.json template exists and is valid JSON", () => {
    const assetlinksPath = path.join(process.cwd(), "public", ".well-known", "assetlinks.json");
    expect(fs.existsSync(assetlinksPath)).toBe(true);

    const content = fs.readFileSync(assetlinksPath, "utf-8");
    const json = JSON.parse(content);
    expect(Array.isArray(json)).toBe(true);
    expect(json[0].relation).toContain("delegate_permission/common.handle_all_urls");
    expect(json[0].target.namespace).toBe("android_app");
  });
});
