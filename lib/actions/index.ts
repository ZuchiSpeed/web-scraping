"use server"

import { revalidatePath } from "next/cache";
import Product from "../model/product.model";
import { connectedDB } from "../mongoose";
import { scrapeAmazonProduct } from "../scraper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";

export async function scrapeAndStoreProduct(productUrl: string) {
    if (!productUrl) return;

    try {
        connectedDB();

        const scrapedProduct = await scrapeAmazonProduct(productUrl);

        if (!scrapedProduct) return;

        let product = scrapedProduct;

        const existingProduct = await Product.findOne({ url: scrapedProduct.url });

        if (existingProduct) {
            const updatedPriceHistory: any = [
                ...existingProduct.priceHistory,
                { price: scrapedProduct.currentPrice }
            ]

            product = {
                ...scrapedProduct,
                priceHistory: updatedPriceHistory,
                lowestPrice: getLowestPrice(updatedPriceHistory),
                highestPrice: getHighestPrice(updatedPriceHistory),
                averagePrice: getAveragePrice(updatedPriceHistory),
            }
        }

        const newProduct = await Product.findOneAndUpdate(
            { url: scrapedProduct.url },
            product,
            { upsert: true, new: true }
        );

        revalidatePath(`/products/${newProduct._id}`);
    } catch (error: any) {
        throw new Error(`Failed to create/update product: ${error.message}`)
    }
}

export async function getProductById(productId: string) {
    try {
        connectedDB()

        const product = await Product.findOne({ _id: productId })
        if (!product) return null

        return product
    } catch (error) {
        console.log(error)
    }
}

export async function getAllProducts() {
    try {
        connectedDB()

        const products = await Product.find()
        if (!products) return null

        return products
    } catch (error) {
        console.log(error)
    }
}

export async function getSimilarProducts(productId: string) {
    try {
        connectedDB()

        const product = await Product.findOne({ _id: productId })
        if (!product) return null

        const similarProducts = await Product.find({
            _id: { $ne: product._id }
        }).limit(3)

        return similarProducts
    } catch (error) {
        console.log(error)
    }
}