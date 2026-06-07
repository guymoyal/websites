import React from 'react';
import { Users, Target, Award, Zap } from 'lucide-react';
import MonetizationLeaderboard from '@/components/ads/MonetizationLeaderboard';
import ResidualDisplayAd from '@/components/ads/ResidualDisplayAd';
import AffiliateStrip from '@/components/ads/AffiliateStrip';
import styles from './page.module.css';

export default function AboutPage() {
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>About AI Buzz World</h1>
        <p className={styles.subtitle}>
          Your trusted companion in discovering the best AI tools for every need
        </p>
      </div>

      <MonetizationLeaderboard slot="categories-top" className={styles.adSlot} />
      <AffiliateStrip variant="row" className={styles.adSlot} />

      <div className={styles.content}>
        <section className={styles.section}>
          <h2>Our Mission</h2>
          <p>
            At AI Buzz World, we believe that artificial intelligence should be accessible to everyone. 
            Our mission is to democratize AI by helping individuals and businesses discover, evaluate, 
            and implement the right AI tools for their specific needs.
          </p>
          <p>
            We curate and review thousands of AI tools across various categories, providing you with 
            comprehensive information, honest reviews, and practical insights to make informed decisions.
          </p>
        </section>

        <section className={styles.features}>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <Target size={32} />
            </div>
            <h3>Curated Selection</h3>
            <p>
              We carefully review and select only the most valuable AI tools, 
              saving you time and ensuring quality.
            </p>
          </div>
          
          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <Award size={32} />
            </div>
            <h3>Expert Reviews</h3>
            <p>
              Our team of AI experts thoroughly tests and reviews each tool 
              to provide you with accurate, unbiased information.
            </p>
          </div>
          
          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <Users size={32} />
            </div>
            <h3>Community Driven</h3>
            <p>
              Real user reviews and ratings help you understand how tools 
              perform in real-world scenarios.
            </p>
          </div>
          
          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <Zap size={32} />
            </div>
            <h3>Always Updated</h3>
            <p>
              We continuously update our database with the latest AI tools 
              and keep information current and relevant.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2>What We Offer</h2>
          <div className={styles.offerings}>
            <div className={styles.offering}>
              <h3>Comprehensive Directory</h3>
              <p>
                Browse through thousands of AI tools organized by category, 
                pricing, and functionality to find exactly what you need.
              </p>
            </div>
            
            <div className={styles.offering}>
              <h3>Detailed Reviews</h3>
              <p>
                Get in-depth analysis of features, pricing, pros and cons, 
                and real-world use cases for each tool.
              </p>
            </div>
            
            <div className={styles.offering}>
              <h3>Comparison Tools</h3>
              <p>
                Compare multiple AI tools side-by-side to make informed 
                decisions based on your specific requirements.
              </p>
            </div>
            
            <div className={styles.offering}>
              <h3>Latest Updates</h3>
              <p>
                Stay informed about the latest AI tool releases, updates, 
                and industry trends through our blog and newsletters.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Our Team</h2>
          <p>
            AI Buzz World is built by a passionate team of AI enthusiasts, 
            developers, and researchers who are dedicated to making AI accessible 
            to everyone. We combine technical expertise with practical experience 
            to provide you with the most valuable insights.
          </p>
          <p>
            Our diverse backgrounds in machine learning, software development, 
            product management, and user experience design allow us to evaluate 
            AI tools from multiple perspectives and provide comprehensive reviews.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Editorial Policy</h2>
          <p>
            We are committed to providing accurate, unbiased, and helpful information about AI tools.
          </p>
          <ul className={styles.policyList}>
            <li><strong>Accuracy:</strong> We verify tool features, pricing, and capabilities before publishing. Information is updated regularly.</li>
            <li><strong>Independence:</strong> Our reviews are based on hands-on testing and research. We disclose any affiliate or partnership relationships.</li>
            <li><strong>Transparency:</strong> Some content is AI-assisted. All articles are fact-checked and edited by our team before publication.</li>
            <li><strong>User-first:</strong> We prioritize helping you find the right tools for your needs, not promoting specific products.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Join Our Community</h2>
          <p>
            We're more than just a directory – we're a community of AI enthusiasts 
            helping each other navigate the rapidly evolving world of artificial intelligence.
          </p>
          <div className={styles.community}>
            <div className={styles.communityItem}>
              <h4>Share Reviews</h4>
              <p>Share your experiences with AI tools to help the community make better decisions.</p>
            </div>
            <div className={styles.communityItem}>
              <h4>Stay Updated</h4>
              <p>Follow our blog and newsletter for the latest AI tool news and insights.</p>
            </div>
          </div>
        </section>
      </div>

      <ResidualDisplayAd slot="categories-bottom" className={styles.adSlot} />
    </div>
  );
}