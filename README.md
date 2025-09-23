# 🛍️ **Myntra AI Hackathon – Smart Shopping Assistant**

## 📌 **Overview**
This project was built as part of the **Myntra Hackathon 2025**.  
It was originally cloned from 👉 [Myntra Clone by vikasdev8](https://github.com/vikasdev8/MyntraClone) and the dataset was taken from  👉 [ronakbokaria/myntra-products-dataset](https://www.kaggle.com/datasets/ronakbokaria/myntra-products-dataset)  
This contains product metadata (names, categories, images, prices) that helps bootstrap product catalogue, embeddings, and recommendation engines.
We have extended the minimal non-functional clone with **AI-powered features** to transform e-commerce experiences with **personalisation, trust, and decision-making support**.  

![Overview]() <!-- Add project overview diagram here -->

---

## 🎯 **Problem Statement**
Shoppers face three key challenges in online fashion:  
- **Lack of peer influence** – friends’ opinions are missing in product discovery.  
- **Overwhelming reviews** – customers struggle to extract useful insights.  
- **Decision fatigue** – comparing wishlist items is tedious and leads to drop-offs.  

---

## 🚀 **Our Solution – 3 Features**

### 1️⃣ **Social Circle Recommendations**
- **What it is**: Hyper-personalised product feed powered by a user’s close connections.  
- **How it works**: Builds a **social graph** from selected friends (min. 10–20 for privacy), merges it with **browsing history & style preferences**, and shows **socially validated recommendations**.  
- **Impact**: Boosts trust, improves discovery, and increases CTR & conversions.  

**Tech Used & Why**  
- **SentenceTransformers** → generate embeddings for similarity between users & products.  
- **CLIP** → align product images with textual metadata for richer matching.
- **BART**→ sequence-to-sequence model designed for both understanding and text generation, so as to sort out the similar items for recommendation. 
- **MongoDB (Friendship Graph)** → store user-friend connections securely.  

![WhatsApp Image 2025-09-22 at 23 19 37_6b6a426b](https://github.com/user-attachments/assets/d18f0e9f-7e36-4ec5-89fd-1c39604e3747)

![WhatsApp Image 2025-09-22 at 23 20 14_94212ef7](https://github.com/user-attachments/assets/f2764b7d-d46c-4cac-8d8c-56b45b3b50ca)
<!-- Add mockup screenshot -->

---

### 2️⃣ **AI Review Summarization**
- **What it is**: An AI component that condenses hundreds of reviews into a simple **“Loved vs Found Issues”** summary.  
- **How it works**: Uses **BERT / FLAN-T5** for summarization + **sentiment analysis** to highlight top positives & negatives.  
- **Impact**: Reduces decision uncertainty, builds confidence, and shortens product evaluation time.  

**Tech Used & Why**  
- **BERT** → strong at sentiment classification (positive, neutral, negative).  
- **FLAN-T5** → optimized for **short, human-readable summaries**.  
- **MongoDB (Reviews Collection)** → store review text and embeddings for retrieval.  

![WhatsApp Image 2025-09-22 at 23 22 34_58d1e98e](https://github.com/user-attachments/assets/161a0e0e-19d2-486b-8f18-f4a93225b9fb)
 <!-- Add AI summary UI screenshot -->

---

### 3️⃣ **Wishlist Contrast Engine**
- **What it is**: A smart **comparison assistant** for wishlist items.  
- **How it works**: Uses **embeddings & contextual recommendation** to auto-compare items (price, fit, delivery, reviews) and highlight best-value picks.  
- **Impact**: Speeds up decision-making, lowers cart drop-offs, and drives conversions.  

**Tech Used & Why**  
-**FLAN-T5**→ summarisation of the comparison of the products suggested by AI.
- **Custom Embeddings** → represent product attributes for better contextual comparisons.  
- **Hybrid Scoring (Rules + ML)** → combine business logic (price, delivery) with AI (preferences).  
- **React (UI)** → dynamic comparison modal with highlights of best picks.  

![WhatsApp Image 2025-09-22 at 23 20 35_04c24177](https://github.com/user-attachments/assets/83c0ad4b-ab63-4e64-a553-de002f2f9671)
![WhatsApp Image 2025-09-22 at 23 21 26_9044f163](https://github.com/user-attachments/assets/95a0e5aa-942d-496f-b873-fca21085bef3)![WhatsApp Image 2025-09-22 at 23 21 43_1e3d846b](https://github.com/user-attachments/assets/e8e0cdc2-ae03-49e3-add5-81fbffafcf87)

<!-- Add wishlist comparison screenshot -->

---

## 🛠 **Tech Stack**

| **Layer**          | **Technologies**                                                                                     | **Why Used** |
|---------------------|-----------------------------------------------------------------------------------------------------|--------------|
| **Frontend**        | React.js, React Native (mobile), Tailwind CSS                                                       | Fast UI development, responsive design, mobile + web parity |
| **Backend**         | Node.js + Express                                                                                   | Lightweight, scalable, easy to connect APIs & ML |
| **Database**        | MongoDB Cluster (Users, Products, Reviews, Friendships)                                             | Flexible schema for user-product interactions |
| **AI/ML Models**    | - **Social Recommendations** → SBERT, CLIP, BART <br> - **Review Summarization** → BERT / FLAN-T5 <br> - **Wishlist Comparison** → Custom embeddings + hybrid scoring + FLAN-T5 | Each chosen for optimal performance in NLP/vision tasks |
| **Infrastructure**  | API Gateway, Load Balancer, Hugging Face Hub for model hosting                                      | Secure scaling & external ML hosting |
| **External Services** |  SendGrid (emails), OAuth (login), Analytics & Monitoring                      |  communication, identity, tracking |

---

## 🏗 **High-Level Architecture**
- **Client Layer** → Mobile App / Web SPA  
- **API Gateway** → Auth, Rate Limiting, Logging  
- **Application Layer** → E-commerce services, AI services, Social graph services  
- **Data Layer** → MongoDB, AI Model Store, CDN for images  
- **External Services** → Email/SMS, OAuth  

![Architecture Diagram](<img width="421" height="595" alt="image" src="https://github.com/user-attachments/assets/f0b3c05f-c4bc-46d7-9975-c603845110aa" />) <!-- Add architecture flowchart here -->

---

## 📊 **Success Metrics**
- **Engagement**: Daily active users on social feed, CTR on recommendations  
- **Conversion**: Wishlist-to-cart conversion, order completion rate  
- **Trust & Satisfaction**: Reduced return rates, improved review usefulness score  

---

## 📌 **Team Notes**
- **Privacy-first design**: No personal friend data shown, only aggregated social proof.  
- **Optimized AI**: Models designed for real-time recommendations & lightweight inference.  
- **Prototype Ready**: Includes working demo flows for all 3 features.  

---

## ✨ **Conclusion**
This project empowers **Myntra shoppers** with **trust, personalisation, and confidence** — creating a **next-gen AI shopping journey**.


---

## ⚡ **How to Run Locally**
npm install   # frontend
cd backend && npm install   # backend
#env files
Be sure to create a config.env file in the backend/config directory and add appropriate variables to use the app.

**Essential Variables**
PORT=
NODE_ENV = 
DB_URI=
YOUR_API_KEY=
CLIENTID=
SECRETID=

**Run the files**
cd backend
npm run dev
cd frontend
npm start
update successfully

**THANK YOU**
## Made with ❤️ by

<table align="center">
  <tr>
    <td align="center">
      <a href="https://github.com/asthasahu2004" target="_blank">
        <img src="https://github.com/asthasahu2004.png" width="150" height="150" style="border-radius:50%; border:4px solid #ff69b4;" alt="Astha Sahu"/>
      </a>
      <br>Astha Sahu
    </td>
    <td width="30"></td> <!-- Gap between avatars -->
    <td align="center">
      <a href="https://github.com/USERNAME" target="_blank">
        <img src="https://github.com/USERNAME.png" width="150" height="150" style="border-radius:50%; border:4px solid #ff69b4;" alt="Khushi Pal"/>
      </a>
      <br>Khushi Pal
    </td>
    <td width="30"></td>
    <td align="center">
      <a href="https://github.com/Vaishhh191919" target="_blank">
        <img src="https://github.com/Vaishhh191919.png" width="150" height="150" style="border-radius:50%; border:4px solid #ff69b4;" alt="Vaishnavi Bandewar"/>
      </a>
      <br>Vaishnavi Bandewar
    </td>
  </tr>
</table>





