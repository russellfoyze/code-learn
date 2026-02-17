import newsletterModel from "../models/newsletterModel.js";

// Subscribe to newsletter
export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.json({ 
        success: false, 
        message: "Email is required" 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.json({ 
        success: false, 
        message: "Please enter a valid email address" 
      });
    }

    // Check if email already exists
    const existingSubscriber = await newsletterModel.findOne({ email: email.toLowerCase() });
    
    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return res.json({ 
          success: false, 
          message: "This email is already subscribed to our newsletter" 
        });
      } else {
        // Reactivate the subscription
        existingSubscriber.isActive = true;
        existingSubscriber.subscribedAt = Date.now();
        await existingSubscriber.save();
        return res.json({ 
          success: true, 
          message: "Successfully resubscribed to newsletter!" 
        });
      }
    }

    // Create new subscription
    const newSubscriber = new newsletterModel({
      email: email.toLowerCase(),
      subscribedAt: Date.now(),
      isActive: true
    });

    await newSubscriber.save();

    res.json({ 
      success: true, 
      message: "Successfully subscribed to newsletter!" 
    });

  } catch (error) {
    console.error("Newsletter subscription error:", error);
    res.json({ 
      success: false, 
      message: error.message || "Failed to subscribe to newsletter" 
    });
  }
};

// Get all newsletter subscribers (admin only)
export const getNewsletterSubscribers = async (req, res) => {
  try {
    const subscribers = await newsletterModel
      .find({ isActive: true })
      .sort({ subscribedAt: -1 }) // Most recent first
      .select('email subscribedAt');

    res.json({ 
      success: true, 
      subscribers: subscribers,
      total: subscribers.length
    });

  } catch (error) {
    console.error("Error fetching newsletter subscribers:", error);
    res.json({ 
      success: false, 
      message: error.message || "Failed to fetch subscribers" 
    });
  }
};

// Unsubscribe from newsletter (optional)
export const unsubscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.json({ 
        success: false, 
        message: "Email is required" 
      });
    }

    const subscriber = await newsletterModel.findOne({ email: email.toLowerCase() });
    
    if (!subscriber) {
      return res.json({ 
        success: false, 
        message: "Email not found in our newsletter list" 
      });
    }

    subscriber.isActive = false;
    await subscriber.save();

    res.json({ 
      success: true, 
      message: "Successfully unsubscribed from newsletter" 
    });

  } catch (error) {
    console.error("Unsubscribe error:", error);
    res.json({ 
      success: false, 
      message: error.message || "Failed to unsubscribe" 
    });
  }
};
