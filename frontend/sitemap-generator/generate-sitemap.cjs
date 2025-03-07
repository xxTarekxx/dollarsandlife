"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// ES module imports (no need for "import * as ...")
var path = require("path");
var fs = require("fs");
var sitemap_1 = require("sitemap");
// Define the base URL of your site
var BASE_URL = 'https://www.dollarsandlife.com';
// Define your static routes
var staticRoutes = [
    { url: '/', changefreq: 'monthly', priority: 1.0 },
    { url: '/extra-income', changefreq: 'monthly', priority: 0.8 },
    { url: '/extra-income/freelancers', changefreq: 'monthly', priority: 0.8 },
    { url: '/extra-income/Budget', changefreq: 'monthly', priority: 0.5 },
    { url: '/extra-income/remote-jobs', changefreq: 'monthly', priority: 0.5 },
    { url: '/extra-income/money-making-apps', changefreq: 'monthly', priority: 0.5 },
    { url: '/shopping-Deals', changefreq: 'weekly', priority: 0.9 },
    { url: '/start-a-blog', changefreq: 'monthly', priority: 0.2 },
    { url: '/my-story', changefreq: 'yearly', priority: 0.1 },
    { url: '/terms-of-service', changefreq: 'yearly', priority: 0.1 },
    { url: '/contact-us', changefreq: 'yearly', priority: 0.1 },
    { url: '/financial-calculators', changefreq: 'yearly', priority: 0.1 }
];
// Function to fetch dynamic routes from multiple JSON files
function fetchDynamicRoutes() {
    return __awaiter(this, void 0, void 0, function () {
        var dynamicRoutes, jsonFiles, _loop_1, _i, jsonFiles_1, filePath;
        return __generator(this, function (_a) {
            dynamicRoutes = [];
            jsonFiles = [
                path.resolve(process.cwd(), 'public/data/remotejobs.json'),
                path.resolve(process.cwd(), 'public/data/freelancejobs.json'),
                path.resolve(process.cwd(), 'public/data/moneymakingapps.json'),
                path.resolve(process.cwd(), 'public/data/budgetdata.json'),
                path.resolve(process.cwd(), 'public/data/startablogdata.json'),
                path.resolve(process.cwd(), 'public/data/mystory.json'),
                path.resolve(process.cwd(), 'public/data/products.json'),
            ];
            _loop_1 = function (filePath) {
                try {
                    var fileContent = fs.readFileSync(filePath, 'utf-8');
                    var jsonData = JSON.parse(fileContent);
                    jsonData.forEach(function (post) {
                        if (!post.id || !post.datePosted) {
                            console.error("Invalid data in ".concat(filePath, ":"), post);
                            return;
                        }
                        // Determine the URL base based on the file type
                        var urlBase = filePath.includes('remotejobs')
                            ? '/extra-income/remote-jobs'
                            : filePath.includes('freelancejobs')
                                ? '/extra-income/freelancers'
                                : filePath.includes('moneymakingapps')
                                    ? '/extra-income/money-making-apps'
                                    : filePath.includes('budgetdata')
                                        ? '/extra-income/Budget'
                                        : filePath.includes('startablogdata')
                                            ? '/start-a-blog'
                                            : filePath.includes('mystory')
                                                ? '/my-story'
                                                : '/products'; // Default URL base for products
                        // Add each entry in the JSON file to dynamic routes
                        dynamicRoutes.push({
                            url: "".concat(urlBase, "/").concat(post.id),
                            changefreq: 'weekly',
                            priority: 0.7,
                            lastmod: post.datePosted || new Date().toISOString(), // Use provided date or current date
                        });
                    });
                }
                catch (err) {
                    console.error("Error reading or parsing ".concat(filePath, ":"), err);
                }
            };
            // Loop through each JSON file and read its contents
            for (_i = 0, jsonFiles_1 = jsonFiles; _i < jsonFiles_1.length; _i++) {
                filePath = jsonFiles_1[_i];
                _loop_1(filePath);
            }
            return [2 /*return*/, dynamicRoutes];
        });
    });
}
// Function to generate the sitemap
function generateSitemap() {
    return __awaiter(this, void 0, void 0, function () {
        var sitemap_2, sitemapPath, writeStream, dynamicRoutes, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    sitemap_2 = new sitemap_1.SitemapStream({ hostname: BASE_URL });
                    sitemapPath = path.resolve(process.cwd(), 'public/sitemap.xml');
                    writeStream = fs.createWriteStream(sitemapPath);
                    // Pipe the sitemap stream to the file stream
                    sitemap_2.pipe(writeStream);
                    // Add static routes to the sitemap
                    staticRoutes.forEach(function (route) { return sitemap_2.write(route); });
                    return [4 /*yield*/, fetchDynamicRoutes()];
                case 1:
                    dynamicRoutes = _a.sent();
                    dynamicRoutes.forEach(function (route) { return sitemap_2.write(route); });
                    // End the sitemap stream
                    sitemap_2.end();
                    // Wait for the sitemap to fully write to the file
                    return [4 /*yield*/, (0, sitemap_1.streamToPromise)(sitemap_2)];
                case 2:
                    // Wait for the sitemap to fully write to the file
                    _a.sent();
                    console.log('Sitemap generated successfully at:', sitemapPath);
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.error('Error generating sitemap:', err_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Run the sitemap generation if this script is run directly
if (process.argv[1] === path.resolve(process.cwd(), 'dist/generate-sitemap.js')) {
    generateSitemap().catch(function (err) {
        console.error('Error during sitemap generation:', err);
    });
}
generateSitemap(); // Automatically execute the function when script runs
