import React from 'react';
import { 
  BarChart3, Shield, Zap, Brain, PieChart, Layout, 
  ArrowRight, CheckCircle2, Globe, Database, Cpu, 
  ChevronRight, Play, Users, TrendingUp
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Zap className="text-amber-500" />,
      title: "Real-time Analytics",
      description: "Process millions of transactions in seconds with our optimized data pipeline."
    },
    {
      icon: <Brain className="text-violet-500" />,
      title: "AI-Powered Insights",
      description: "Leverage Gemini 1.5 Pro to identify hidden patterns and growth opportunities."
    },
    {
      icon: <Layout className="text-blue-500" />,
      title: "Interactive Visualizations",
      description: "Power BI-style dashboards that let you drill down into every customer segment."
    },
    {
      icon: <Users className="text-emerald-500" />,
      title: "Customer Segmentation",
      description: "Advanced RFM clustering to group customers by value, loyalty, and risk."
    },
    {
      icon: <TrendingUp className="text-rose-500" />,
      title: "Executive Dashboards",
      description: "High-level KPIs designed for stakeholders to make data-driven decisions."
    }
  ];

  const techs = [
    { name: "Python", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
    { name: "Apache Spark", icon: "https://upload.wikimedia.org/wikipedia/commons/f/f3/Apache_Spark_logo.svg" },
    { name: "React", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
    { name: "Firebase", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg" },
    { name: "Gemini AI", icon: "https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304fb62aa256b302.svg" }
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F4] text-gray-900 font-sans selection:bg-black selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-black/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center">
              <BarChart3 size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight">InsightCart</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
            <a href="#about" className="hover:text-black transition-colors">About</a>
            <a href="#features" className="hover:text-black transition-colors">Features</a>
            <a href="#tech" className="hover:text-black transition-colors">Technology</a>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="text-sm font-bold hover:text-black transition-colors"
            >
              Login
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="px-5 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-lg shadow-black/10"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 bg-violet-100 text-violet-600 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6">
              AI-Powered Business Intelligence Platform
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 max-w-4xl mx-auto leading-[1.1]">
              Transform Your Business Data into <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-emerald-600">Actionable Insights</span>
            </h1>
            <p className="text-xl text-gray-500 mb-12 max-w-2xl mx-auto serif italic">
              InsightCart uses advanced RFM analysis and AI to help you understand your customers, predict churn, and drive sustainable growth.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              <button 
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-8 py-4 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all group"
              >
                Get Started Free <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-8 py-4 bg-white text-black border border-black/10 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
              >
                <Play size={18} /> Explore Dashboard
              </button>
            </div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative max-w-5xl mx-auto"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/20 to-emerald-500/20 blur-3xl rounded-[3rem] -z-10"></div>
            <div className="bg-white rounded-[2rem] p-2 shadow-2xl border border-black/5 overflow-hidden">
              <img 
                src="https://picsum.photos/seed/dashboard/1600/900" 
                alt="InsightCart Dashboard Preview" 
                className="rounded-[1.5rem] w-full shadow-inner"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 bg-white px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl font-bold tracking-tight mb-8">What is InsightCart?</h2>
              <p className="text-lg text-gray-600 mb-10 leading-relaxed">
                InsightCart is an enterprise-grade customer intelligence platform designed for modern e-commerce. We bridge the gap between raw transaction data and strategic decision-making.
              </p>
              <div className="space-y-6">
                {[
                  "Automated Customer Segmentation using RFM models",
                  "Business performance analytics & KPI tracking",
                  "AI-driven growth insights and churn prediction",
                  "Interactive, drill-down dashboards for all teams"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 size={14} />
                    </div>
                    <span className="font-medium text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-12">
                <div className="bg-gray-50 p-8 rounded-3xl border border-black/5">
                  <div className="text-3xl font-bold mb-2">98%</div>
                  <div className="text-xs font-mono text-gray-400 uppercase tracking-widest">Accuracy</div>
                </div>
                <div className="bg-black text-white p-8 rounded-3xl">
                  <div className="text-3xl font-bold mb-2">10x</div>
                  <div className="text-xs font-mono text-gray-400 uppercase tracking-widest">Faster Insights</div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-violet-600 text-white p-8 rounded-3xl">
                  <div className="text-3xl font-bold mb-2">24/7</div>
                  <div className="text-xs font-mono text-white/60 uppercase tracking-widest">Monitoring</div>
                </div>
                <div className="bg-gray-50 p-8 rounded-3xl border border-black/5">
                  <div className="text-3xl font-bold mb-2">5M+</div>
                  <div className="text-xs font-mono text-gray-400 uppercase tracking-widest">Data Points</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold tracking-tight mb-4">Powerful Features</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Everything you need to master your customer data and drive revenue.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white p-10 rounded-[2.5rem] border border-black/5 shadow-sm hover:shadow-xl transition-all"
              >
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-8">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section id="tech" className="py-32 bg-black text-white px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl font-bold tracking-tight mb-8">Built with Modern Data Stack</h2>
              <p className="text-gray-400 mb-12 leading-relaxed">
                We use the most powerful technologies in the industry to ensure your data is processed accurately and presented beautifully.
              </p>
              <div className="flex flex-wrap gap-10">
                {techs.map((t, i) => (
                  <div key={i} className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center p-3 grayscale hover:grayscale-0 transition-all cursor-pointer">
                      <img src={t.icon} alt={t.name} className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500">{t.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-20 bg-violet-600/20 blur-[100px] rounded-full"></div>
              <div className="relative bg-white/5 border border-white/10 rounded-[3rem] p-10 backdrop-blur-3xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                </div>
                <div className="space-y-4 font-mono text-xs text-violet-300">
                  <p className="text-gray-500">// Initializing Spark Session</p>
                  <p>spark = SparkSession.builder.appName("InsightCart").getOrCreate()</p>
                  <p className="text-gray-500">// Running RFM Pipeline</p>
                  <p>df = spark.read.parquet("transactions.parquet")</p>
                  <p>rfm_df = pipeline.transform(df)</p>
                  <p className="text-gray-500">// Generating AI Insights</p>
                  <p>insights = gemini.analyze(rfm_df.summary())</p>
                  <p className="text-emerald-400">Pipeline completed in 1.2s</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-violet-600 to-indigo-700 rounded-[3rem] p-16 text-center text-white relative overflow-hidden shadow-2xl shadow-violet-500/20">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-400 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-8 relative z-10">Ready to unlock your data's potential?</h2>
          <p className="text-violet-100 mb-12 max-w-xl mx-auto text-lg relative z-10">
            Join hundreds of e-commerce brands using InsightCart to drive growth and loyalty.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <button 
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-10 py-5 bg-white text-violet-600 rounded-2xl font-bold hover:bg-violet-50 transition-all shadow-xl"
            >
              Start Analyzing Data
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-10 py-5 bg-violet-500/30 text-white border border-white/20 rounded-2xl font-bold hover:bg-violet-500/40 transition-all"
            >
              Book Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-black/5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center">
              <BarChart3 size={18} />
            </div>
            <span className="text-lg font-bold tracking-tight">InsightCart</span>
          </div>
          <div className="flex gap-8 text-sm text-gray-400">
            <a href="#" className="hover:text-black transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-black transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-black transition-colors">Contact</a>
          </div>
          <p className="text-sm text-gray-400 font-mono uppercase tracking-widest">
            © 2026 InsightCart Pro • Enterprise Grade
          </p>
        </div>
      </footer>
    </div>
  );
};
