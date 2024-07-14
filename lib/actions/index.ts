"use server"

import { revalidatePath } from "next/cache";
import Product from "../model/product.model";
import { connectedDB } from "../mongoose";
import { scrapeAmazonProduct } from "../scraper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import { User } from "@/types";
import { generateEmailBody, sendEmail } from "../nodemailer";

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


export async function addUserEmailToProduct(productId: string, userEmail: string) {
    try {
        connectedDB()

        const product = await Product.findById({ _id: productId })
        if (!product) return null

        //Call user Email else push an email to a user
        const userExists = product.users.some((user: User) => user.email === userEmail)
        if(!userExists) {
            product.users.push({ email: userEmail })

            await product.save()

            const emailContent = await generateEmailBody(product, 'WELCOME')
            await sendEmail(emailContent, [userEmail])
        }


        const getUserEmail = await Product.find({ users: userEmail })

        return {productId, getUserEmail}
    } catch (error) {

    }
}