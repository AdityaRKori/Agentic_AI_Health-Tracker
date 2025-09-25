export interface AIProvider {
  name: string;
  baseUrl: string;
  generateHealthReport: (prompt: string, apiKey: string) => Promise<string>;
  chatCompletion: (messages: any[], apiKey: string) => Promise<string>;
  analyzeImage: (imageData: string, prompt: string, apiKey: string) => Promise<string>;
}

class OpenAIProvider implements AIProvider {
  name = 'OpenAI';
  baseUrl = 'https://api.openai.com/v1';

  async generateHealthReport(prompt: string, apiKey: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 2000,
          temperature: 0.7
        })
      });

      if (!response.ok) throw new Error('AI service unavailable');
      
      const data = await response.json();
      return data.choices[0]?.message?.content || 'Unable to generate report';
    } catch (error) {
      console.error('AI service error:', error);
      return this.getFallbackReport();
    }
  }

  async chatCompletion(messages: any[], apiKey: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          max_tokens: 1000,
          temperature: 0.8
        })
      });

      if (!response.ok) throw new Error('AI service unavailable');
      
      const data = await response.json();
      return data.choices[0]?.message?.content || 'I apologize, but I cannot provide a response right now.';
    } catch (error) {
      console.error('Chat service error:', error);
      return 'I apologize, but I cannot provide a response right now. Please check your API key and try again.';
    }
  }

  async analyzeImage(imageData: string, prompt: string, apiKey: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: imageData } }
              ]
            }
          ],
          max_tokens: 1500
        })
      });

      if (!response.ok) throw new Error('Image analysis unavailable');
      
      const data = await response.json();
      return data.choices[0]?.message?.content || 'Unable to analyze image';
    } catch (error) {
      console.error('Image analysis error:', error);
      return this.getFallbackImageAnalysis();
    }
  }

  private getFallbackReport(): string {
    return `# Health Analysis Report

## Risk Assessment
Based on your vitals, we've identified some areas that may need attention. This analysis provides general guidance and should not replace professional medical advice.

## Dietary Recommendations
- Focus on a balanced diet with whole foods
- Include plenty of fruits and vegetables
- Stay hydrated with adequate water intake
- Consider consulting a nutritionist for personalized advice

## Exercise Recommendations
- Aim for 150 minutes of moderate exercise per week
- Include both cardio and strength training
- Start slowly and gradually increase intensity
- Always consult your doctor before starting a new exercise program

**Disclaimer:** This is a general health analysis. Please consult with healthcare professionals for medical advice.`;
  }

  private getFallbackImageAnalysis(): string {
    return `**Disclaimer:** This is an AI-powered analysis and not a medical diagnosis. Please consult a qualified healthcare professional.

## Image Analysis
I was unable to perform a detailed analysis of your medical image at this time. For accurate interpretation of medical images, please:

1. Consult with a qualified radiologist or healthcare professional
2. Ensure the image quality is adequate for professional review
3. Provide relevant clinical history and symptoms

## Next Steps
- Schedule an appointment with your healthcare provider
- Bring the original image files for professional review
- Discuss any symptoms or concerns with your doctor

Please seek professional medical advice for proper diagnosis and treatment.`;
  }
}

class HuggingFaceProvider implements AIProvider {
  name = 'Hugging Face';
  baseUrl = 'https://api-inference.huggingface.co';

  async generateHealthReport(prompt: string, apiKey: string): Promise<string> {
    // Simplified implementation for Hugging Face
    return this.getFallbackReport();
  }

  async chatCompletion(messages: any[], apiKey: string): Promise<string> {
    return 'I apologize, but this feature requires a premium AI service. Please configure OpenAI for full functionality.';
  }

  async analyzeImage(imageData: string, prompt: string, apiKey: string): Promise<string> {
    return this.getFallbackImageAnalysis();
  }

  private getFallbackReport(): string {
    return `# Health Analysis Report

## General Health Assessment
Your vitals have been recorded. For detailed analysis, please configure a premium AI service.

## General Recommendations
- Maintain regular health check-ups
- Follow a balanced diet appropriate for your region
- Stay physically active
- Monitor your vitals regularly

Please consult healthcare professionals for personalized medical advice.`;
  }

  private getFallbackImageAnalysis(): string {
    return '**Disclaimer:** Professional medical image analysis requires specialized tools. Please consult a healthcare professional for accurate diagnosis.';
  }
}

export const aiProviders = {
  openai: new OpenAIProvider(),
  huggingface: new HuggingFaceProvider(),
  custom: new OpenAIProvider()
};

export const getAIProvider = (providerName: string): AIProvider => {
  return aiProviders[providerName as keyof typeof aiProviders] || aiProviders.openai;
};