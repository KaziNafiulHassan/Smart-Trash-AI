# Smart Trash AI - EcoSort Adventures

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Neo4j](https://img.shields.io/badge/Neo4j-5.x-green.svg)](https://neo4j.com/)

An AI-powered educational platform for waste sorting and environmental education, developed as part of the **SMART TRASH** research project at **Magdeburg-Stendal University of Applied Sciences**.

**🌐 Live Demo**: [https://smart-trash-ai.lovable.app/](https://smart-trash-ai.lovable.app/)

## 🎯 Project Overview

This educational platform is being developed under **Pillar 2: Robot-Assisted Citizen-Oriented Education** of the SMART TRASH research initiative. The project aims to create innovative robot-human interaction solutions for environmental education, with plans for integration into educational robots and expansion across German cities.

### 🏛️ Academic Context

**Institution**: Magdeburg-Stendal University of Applied Sciences
**Project**: Smart-TRASH (Smart Technologies for Recycling and Sustainable Handling)
**Focus Area**: Robot-Assisted Citizen-Oriented Education
**Research Goal**: Sustainable waste stream quality improvement through innovative educational technology

### 🚀 Innovation Potential & Transfer Opportunities
- **High innovation** in robot-human interaction for environmental education
- **Technology transfer opportunities** through spin-offs and cooperations
- **Lighthouse project potential** for Saxony-Anhalt and Germany
- **Measurable impact** on waste sorting quality through citizen engagement
- **Scalable deployment** from Magdeburg to other cities across Germany

### 🎯 Development Goals
- Leverage recent robotic advances for waste separation education
- Create touchscreen interfaces with multi-language support
- Develop AI-powered waste detection and educational feedback
- Sustainably enhance waste stream quality through citizen engagement
- Enable minimal-effort organizational integration (installation, charging, relocation)

### 🔬 Implementation & Integration
- **Educational robot integration** for physical learning environments
- **Urban education workflow integration** with minimal organizational adjustments
- **Waste quality measurement** and improvement tracking
- **Demonstration of successful project integration** and measurable impact

## 🌟 Features

### 🎮 Interactive Game Experience
- **Drag-and-drop waste sorting game** with real-time feedback
- **Progressive difficulty levels** with diverse waste items
- **Gamification elements** including scoring, streaks, and achievements
- **Multi-language support** for international accessibility
- **Responsive design** optimized for touchscreen interfaces

### 🤖 AI-Powered Education
- **Graph RAG (Retrieval-Augmented Generation)** using Neo4j knowledge graphs
- **Multiple LLM models** via OpenRouter API for diverse educational responses
- **Real-time waste classification** with computer vision integration
- **Personalized learning paths** based on user performance
- **Intelligent feedback system** with structured educational responses

### 📊 Analytics & Research
- **Comprehensive user interaction tracking** for research purposes
- **Performance analytics** to measure educational effectiveness
- **Feedback systems** for continuous improvement
- **Data export capabilities** for academic research
- **Waste quality improvement metrics**

### 🎨 Modern User Interface
- **Responsive design** optimized for desktop, mobile, and robot touchscreens
- **Accessibility features** following WCAG guidelines
- **Dark/light theme support** for user preference
- **Intuitive navigation** suitable for all age groups
- **Multi-language interface** for diverse user groups

## 🛠️ Technology Stack

- **Frontend**: React 18.x with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: Neo4j AuraDB for knowledge graph storage
- **AI/ML**: OpenRouter API with multiple LLM models (Mistral, Llama, Qwen)
- **Build Tool**: Vite for fast development and building
- **Deployment**: Lovable platform with custom domain support
- **Version Control**: Git with GitHub integration

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Neo4j AuraDB instance
- OpenRouter API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/KaziNafiulHassan/Smart-Trash-AI.git
   cd Smart-Trash-AI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy example files
   cp .env.example .env
   cp neo4j.env.example neo4j.env

   # Edit with your actual credentials (see Environment Setup section)
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173`

### Build for Production
```bash
npm run build
npm run preview
```

## 🔧 Environment Setup

This project requires several environment variables to function properly. For security reasons, these are not included in the repository.

### Required Environment Files

1. **`.env`** - Main application environment variables
2. **`neo4j.env`** - Neo4j database credentials

### Configuration Details

**`.env`** requires:
- `VITE_NEO4J_URI` - Your Neo4j AuraDB connection URI
- `VITE_NEO4J_USERNAME` - Your Neo4j username
- `VITE_NEO4J_PASSWORD` - Your Neo4j password
- `VITE_OPENROUTER_API_KEY` - Your OpenRouter API key for LLM services
- `VITE_SITE_URL` - Your deployment URL
- `VITE_SITE_NAME` - Application name

**`neo4j.env`** requires:
- `NEO4J_URI` - Your Neo4j AuraDB connection URI
- `NEO4J_USERNAME` - Your Neo4j username
- `NEO4J_PASSWORD` - Your Neo4j password
- `NEO4J_DATABASE` - Database name (usually 'neo4j')

### Security Notes
- Never commit `.env` or `neo4j.env` files to version control
- These files are automatically ignored by Git
- Use the `.example` files as templates for new deployments

## 🤝 Contributing

We welcome contributions from the academic community and industry partners! This project is part of ongoing research at Magdeburg-Stendal University of Applied Sciences.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Research Collaboration
For academic collaborations, research partnerships, or technology transfer opportunities, please contact the research team at Magdeburg-Stendal University of Applied Sciences.

## 📊 Research & Analytics

This platform includes comprehensive analytics for research purposes:
- User interaction patterns
- Learning effectiveness metrics
- Waste sorting accuracy improvements
- Educational content engagement
- Multi-language usage statistics

Data collected supports ongoing research into robot-assisted environmental education and citizen engagement strategies.

## 🔮 Future Development

### Robot Integration Roadmap
- **Physical robot integration** with touchscreen interfaces
- **Computer vision modules** for real-time waste detection
- **Multi-language voice interaction** capabilities
- **Adaptive learning algorithms** based on user performance
- **IoT connectivity** for smart city integration

### Expansion Plans
- **Pilot deployment** in Magdeburg educational institutions
- **Scaling to other Saxony-Anhalt cities** based on measured success
- **National expansion** as a German lighthouse project
- **International collaboration** opportunities

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏫 Academic Citation

If you use this software in your research, please cite:

```bibtex
@software{smart_trash_ai_2024,
  title={Smart Trash AI: EcoSort Adventures},
  author={SMART TRASH Pillar Research Team},
  institution={Magdeburg-Stendal University of Applied Sciences},
  year={2024},
  url={https://github.com/KaziNafiulHassan/Smart-Trash-AI}
}
```

## 📞 Contact & Support

**Research Team**: SMART TRASH Pillar
**Institution**: Magdeburg-Stendal University of Applied Sciences
**Project Focus**: Robot-Assisted Citizen-Oriented Education

For technical support, research collaboration, or technology transfer inquiries, please open an issue in this repository or contact the research team directly.

---

*This project is part of the SMART TRASH Pillar research initiative, focusing on innovative robot-human interaction for environmental education and sustainable waste management.*
