const tf = require('@tensorflow/tfjs-node');
const mobilenet = require('@tensorflow-models/mobilenet');
const { createCanvas, loadImage } = require('canvas');
const natural = require('natural');
const axios = require('axios');

class SimilarityAnalyzer {
  constructor() {
    this.model = null;
    this.tokenizer = new natural.WordTokenizer();
    this.tfidf = new natural.TfIdf();
  }

  async initialize() {
    if (!this.model) {
      this.model = await mobilenet.load();
    }
  }

  async getImageFeatures(imageUrl) {
    try {
      // Load and prepare image
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const image = await loadImage(Buffer.from(response.data));
      
      // Create canvas and draw image
      const canvas = createCanvas(224, 224);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0, 224, 224);
      
      // Get image features
      const tensor = tf.browser.fromPixels(canvas)
        .toFloat()
        .expandDims();
      
      const features = await this.model.infer(tensor, true);
      return features.dataSync();
    } catch (error) {
      console.error('Error getting image features:', error);
      throw error;
    }
  }

  calculateImageSimilarity(features1, features2) {
    const a = tf.tensor1d(features1);
    const b = tf.tensor1d(features2);
    const cosineSimilarity = tf.losses.cosineDistance(a, b).dataSync()[0];
    return 1 - cosineSimilarity; // Convert distance to similarity
  }

  calculateTextSimilarity(text1, text2) {
    // Tokenize and clean texts
    const tokens1 = this.tokenizeAndClean(text1);
    const tokens2 = this.tokenizeAndClean(text2);

    // Add documents to TF-IDF
    this.tfidf.addDocument(tokens1);
    this.tfidf.addDocument(tokens2);

    // Calculate TF-IDF vectors
    const vector1 = this.getTfidfVector(0);
    const vector2 = this.getTfidfVector(1);

    // Calculate cosine similarity
    return this.calculateCosineSimilarity(vector1, vector2);
  }

  tokenizeAndClean(text) {
    const tokens = this.tokenizer.tokenize(text.toLowerCase());
    return tokens.filter(token => token.length > 2); // Remove short words
  }

  getTfidfVector(docIndex) {
    const vector = {};
    this.tfidf.listTerms(docIndex).forEach(item => {
      vector[item.term] = item.tfidf;
    });
    return vector;
  }

  calculateCosineSimilarity(vector1, vector2) {
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    // Calculate dot product and norms
    for (const term in vector1) {
      if (vector2[term]) {
        dotProduct += vector1[term] * vector2[term];
      }
      norm1 += vector1[term] * vector1[term];
    }

    for (const term in vector2) {
      norm2 += vector2[term] * vector2[term];
    }

    // Return cosine similarity
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  async analyzeSimilarity(sourceItem, comparisonItem) {
    try {
      // Initialize if needed
      await this.initialize();

      // Get image features
      const sourceFeatures = await this.getImageFeatures(sourceItem.imageUrl);
      const comparisonFeatures = await this.getImageFeatures(comparisonItem.imageUrl);

      // Calculate similarities
      const imageSimilarity = this.calculateImageSimilarity(sourceFeatures, comparisonFeatures);
      const titleSimilarity = this.calculateTextSimilarity(sourceItem.title, comparisonItem.title);
      
      let descriptionSimilarity = 0;
      if (sourceItem.description && comparisonItem.description) {
        descriptionSimilarity = this.calculateTextSimilarity(
          sourceItem.description,
          comparisonItem.description
        );
      }

      // Calculate overall similarity score
      const overallSimilarity = (
        imageSimilarity * 0.4 + 
        titleSimilarity * 0.4 + 
        descriptionSimilarity * 0.2
      );

      return {
        imageSimilarity,
        titleSimilarity,
        descriptionSimilarity,
        overallSimilarity
      };
    } catch (error) {
      console.error('Error analyzing similarity:', error);
      throw error;
    }
  }
}

module.exports = new SimilarityAnalyzer();
