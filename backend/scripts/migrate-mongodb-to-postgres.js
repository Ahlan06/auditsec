import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initDatabase, getRepositories } from '../db/index.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import AccountProduct from '../models/AccountProduct.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from backend folder
dotenv.config({ path: join(__dirname, '..', '.env') });

/**
 * Script de migration des données MongoDB vers PostgreSQL/Supabase
 * Usage: node backend/scripts/migrate-mongodb-to-postgres.js
 */

async function migrateData() {
  console.log('🚀 Starting data migration from MongoDB to PostgreSQL...\n');

  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/auditsec';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Connect to PostgreSQL
    await initDatabase();
    const repos = await getRepositories();
    console.log('✅ Connected to PostgreSQL\n');

    // ======================
    // MIGRATE USERS
    // ======================
    console.log('👥 Migrating users...');
    const mongoUsers = await User.find({});
    console.log(`   Found ${mongoUsers.length} users in MongoDB`);

    let usersMigrated = 0;
    let usersFailed = 0;
    const userIdMap = new Map(); // MongoDB ID -> PostgreSQL ID

    for (const user of mongoUsers) {
      try {
        const newUser = await repos.userRepository.create({
          email: user.email,
          passwordHash: user.passwordHash,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          emailVerified: user.emailVerified || false,
          phoneVerified: user.phoneVerified || false,
        });

        userIdMap.set(user._id.toString(), newUser.id);
        usersMigrated++;
        console.log(`   ✅ ${usersMigrated}/${mongoUsers.length} - ${user.email}`);
      } catch (err) {
        usersFailed++;
        console.error(`   ❌ Failed: ${user.email} - ${err.message}`);
      }
    }

    console.log(`\n📊 Users: ${usersMigrated} migrated, ${usersFailed} failed\n`);

    // ======================
    // MIGRATE PRODUCTS
    // ======================
    console.log('📦 Migrating products...');
    const mongoProducts = await Product.find({});
    console.log(`   Found ${mongoProducts.length} products in MongoDB`);

    let productsMigrated = 0;
    let productsFailed = 0;
    const productIdMap = new Map(); // MongoDB ID -> PostgreSQL ID

    for (const product of mongoProducts) {
      try {
        const newProduct = await repos.productRepository.create({
          name: product.name,
          description: product.description,
          longDescription: product.longDescription || '',
          price: product.price,
          category: product.category,
          type: product.type,
          image: product.image || '/images/default-product.jpg',
          fileUrl: product.fileUrl,
          fileSize: product.fileSize || 'N/A',
          tags: product.tags || [],
          featured: product.featured || false,
          active: product.active !== undefined ? product.active : true,
          stripeProductId: product.stripeProductId,
          stripePriceId: product.stripePriceId,
        });

        productIdMap.set(product._id.toString(), newProduct.id);
        productsMigrated++;
        console.log(`   ✅ ${productsMigrated}/${mongoProducts.length} - ${product.name}`);
      } catch (err) {
        productsFailed++;
        console.error(`   ❌ Failed: ${product.name} - ${err.message}`);
      }
    }

    console.log(`\n📊 Products: ${productsMigrated} migrated, ${productsFailed} failed\n`);

    // ======================
    // MIGRATE ACCOUNT PRODUCTS
    // ======================
    console.log('🔐 Migrating account products...');
    const mongoAccounts = await AccountProduct.find({});
    console.log(`   Found ${mongoAccounts.length} account products in MongoDB`);

    let accountsMigrated = 0;
    let accountsFailed = 0;

    for (const account of mongoAccounts) {
      try {
        const postgresProductId = productIdMap.get(account.productId?.toString());
        if (!postgresProductId) {
          console.warn(`   ⚠️ Skipping account: product not found in mapping`);
          accountsFailed++;
          continue;
        }

        await repos.accountProductRepository.create({
          productId: postgresProductId,
          serviceName: account.serviceName,
          accountType: account.accountType,
          username: account.credentials.username,
          password: account.credentials.password,
          additionalInfo: account.credentials.additionalInfo,
          validUntil: account.validUntil,
          deliveryTemplate: account.deliveryTemplate,
          usageInstructions: account.usageInstructions,
          region: account.region || 'Global',
          features: account.features || [],
          warningMessage: account.warningMessage,
        });

        accountsMigrated++;
        console.log(`   ✅ ${accountsMigrated}/${mongoAccounts.length} - ${account.serviceName}`);
      } catch (err) {
        accountsFailed++;
        console.error(`   ❌ Failed: ${account.serviceName} - ${err.message}`);
      }
    }

    console.log(`\n📊 Account Products: ${accountsMigrated} migrated, ${accountsFailed} failed\n`);

    // ======================
    // MIGRATE ORDERS
    // ======================
    console.log('🛒 Migrating orders...');
    const mongoOrders = await Order.find({}).populate('products.productId');
    console.log(`   Found ${mongoOrders.length} orders in MongoDB`);

    let ordersMigrated = 0;
    let ordersFailed = 0;

    for (const order of mongoOrders) {
      try {
        // Map product IDs to PostgreSQL IDs
        const products = order.products
          .map((p) => {
            const postgresProductId = productIdMap.get(p.productId?._id?.toString());
            if (!postgresProductId) {
              console.warn(`   ⚠️ Order ${order.orderId}: product not found in mapping`);
              return null;
            }
            return {
              productId: postgresProductId,
              name: p.name,
              price: p.price,
              quantity: p.quantity || 1,
            };
          })
          .filter(Boolean);

        if (products.length === 0) {
          console.warn(`   ⚠️ Skipping order ${order.orderId}: no valid products`);
          ordersFailed++;
          continue;
        }

        const newOrder = await repos.orderRepository.create({
          orderId: order.orderId,
          customerEmail: order.customerEmail,
          customerName: order.customerName,
          products,
          totalAmount: order.totalAmount,
          currency: order.currency || 'eur',
          status: order.status || 'completed',
          paymentMethod: order.paymentMethod || 'stripe',
          stripeSessionId: order.stripeSessionId,
          stripePaymentIntentId: order.stripePaymentIntentId,
          cryptoPaymentData: order.cryptoPaymentData,
          ipAddress: order.ipAddress,
          userAgent: order.userAgent,
        });

        // Migrate download tokens
        if (order.downloadTokens && order.downloadTokens.length > 0) {
          for (const token of order.downloadTokens) {
            const postgresProductId = productIdMap.get(token.productId?.toString());
            if (postgresProductId) {
              await repos.orderRepository.createDownloadToken(
                newOrder.id,
                postgresProductId,
                token.token,
                token.expiresAt
              );

              if (token.used) {
                await repos.orderRepository.markTokenAsUsed(token.token);
              }
            }
          }
        }

        // Mark email as sent if applicable
        if (order.emailSent) {
          await repos.orderRepository.markEmailSent(order.orderId);
        }

        ordersMigrated++;
        console.log(`   ✅ ${ordersMigrated}/${mongoOrders.length} - ${order.orderId}`);
      } catch (err) {
        ordersFailed++;
        console.error(`   ❌ Failed: ${order.orderId} - ${err.message}`);
      }
    }

    console.log(`\n📊 Orders: ${ordersMigrated} migrated, ${ordersFailed} failed\n`);

    // ======================
    // SUMMARY
    // ======================
    console.log('═══════════════════════════════════════');
    console.log('📊 MIGRATION SUMMARY');
    console.log('═══════════════════════════════════════');
    console.log(`Users:           ${usersMigrated}/${mongoUsers.length} (${usersFailed} failed)`);
    console.log(`Products:        ${productsMigrated}/${mongoProducts.length} (${productsFailed} failed)`);
    console.log(`Account Products: ${accountsMigrated}/${mongoAccounts.length} (${accountsFailed} failed)`);
    console.log(`Orders:          ${ordersMigrated}/${mongoOrders.length} (${ordersFailed} failed)`);
    console.log('═══════════════════════════════════════');

    const totalSuccess = usersMigrated + productsMigrated + accountsMigrated + ordersMigrated;
    const totalFailed = usersFailed + productsFailed + accountsFailed + ordersFailed;

    if (totalFailed === 0) {
      console.log('\n✅ Migration completed successfully! All data migrated.');
    } else {
      console.log(`\n⚠️ Migration completed with ${totalFailed} failures. Check logs above.`);
    }

    await mongoose.connection.close();
    console.log('\n✅ MongoDB connection closed');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateData();
