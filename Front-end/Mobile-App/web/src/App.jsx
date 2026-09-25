import Hero from './components/Hero'
import Features from './components/Features'
import HowItWorks from './components/HowItWorks'
import Pricing from './components/Pricing'
import CTASection from './components/CTASection'
import Footer from './components/Footer'

function App() {
  return (
    <>
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
        <CTASection />
      </main>
      
      <Footer />
    </>
  )
}

export default App
