import Product from "@/lib/model/product.model";
import { connectedDB } from "@/lib/mongoose";
import { generateEmailBody, sendEmail } from "@/lib/nodemailer";
import { scrapeAmazonProduct } from "@/lib/scraper";
import { getAveragePrice, getEmailNotifType, getHighestPrice, getLowestPrice } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    connectedDB()

    const products = await Product.find({});

    if (!products) throw new Error("No products found")

    //1. Scrape Latest Product Details & Update DB
    const updatedProducts = await Promise.all(
      products.map(async (currentProduct) => {
        const scrapedProduct = await scrapeAmazonProduct(currentProduct.url);

        if (!scrapedProduct) throw new Error("No product found")

        const updatedPriceHistory = [
          ...currentProduct.priceHistory,
          { price: scrapedProduct.currentPrice },
        ]

        const product = {
          ...scrapedProduct,
          priceHistory: updatedPriceHistory,
          lowestPrice: getLowestPrice(updatedPriceHistory),
          highestPrice: getHighestPrice(updatedPriceHistory),
          averagePrice: getAveragePrice(updatedPriceHistory),
        };

        const updatedProduct = await Product.findOneAndUpdate({
          url: scrapedProduct.url
        },
          product
        );

        //2. Check each products status & send email accordingly
        const emailNotifyType = getEmailNotifType(scrapedProduct, currentProduct)

        //check if emailNotification exists & check if user is within the database to update
        if(emailNotifyType && updatedProduct.users.length > 0) {
          const productInfo = {
            title: updatedProduct.title,
            url: updatedProduct.url
          }

          const emailContent = await generateEmailBody(productInfo, emailNotifyType)
          const userEmail = updatedProduct.users.map((user: any) => user.email)

          await sendEmail(emailContent, userEmail)
        }

        return updatedProduct
      })
    )

    return NextResponse.json({
      message: 'OK', data: updatedProducts
    })
  } catch (error) {
    console.log(error)
  }
}