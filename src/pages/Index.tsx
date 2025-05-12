import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, Menu, X, Shield, Calendar, Clock, CreditCard, 
  BookOpen, Check, ChevronLeft, ChevronRight, Quote, Mail, Phone 
} from 'lucide-react';

const Index = () => {
  // Navbar state
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [email, setEmail] = useState('');
  
  // Testimonials state
  const [activeIndex, setActiveIndex] = useState(0);

  // Handle scroll for navbar effect
  useState(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Testimonials navigation
  const nextTestimonial = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'}`}>
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-psyplex rounded-xl w-10 h-10 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6C16.2 6 14.6 6.8 13.5 8C12.3 7.4 11.2 7.1 10 7.1C9.7 7.1 9.4 7.1 9.1 7.2C8.3 10.4 9 14.2 11.1 16.9C12.7 18.9 14.9 20.1 17.1 20.4C17.7 20.5 18.3 20.5 18.9 20.4C21.1 20.1 23.3 18.9 24.9 16.9C27 14.2 27.7 10.4 26.9 7.2C26.6 7.1 26.3 7.1 26 7.1C24.8 7.1 23.7 7.4 22.5 8C21.4 6.8 19.8 6 18 6ZM10 29C12.2 29 14 27.2 14 25C14 22.8 12.2 21 10 21C7.8 21 6 22.8 6 25C6 27.2 7.8 29 10 29ZM18 35C20.2 35 22 33.2 22 31C22 28.8 20.2 27 18 27C15.8 27 14 28.8 14 31C14 33.2 15.8 35 18 35ZM26 29C28.2 29 30 27.2 30 25C30 22.8 28.2 21 26 21C23.8 21 22 22.8 22 25C22 27.2 23.8 29 26 29Z" fill="white"/>
                </svg>
              </div>
              <span className="text-psyplex font-bold text-xl">PsyPlex</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/product" className="text-gray-700 hover:text-psyplex transition-colors">Product</Link>
              <Link to="/pricing" className="text-gray-700 hover:text-psyplex transition-colors">Pricing</Link>
              <Link to="/blog" className="text-gray-700 hover:text-psyplex transition-colors">Blog</Link>
              <Link to="/contact" className="text-gray-700 hover:text-psyplex transition-colors">Contact</Link>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost" className="text-gray-700 hover:text-psyplex">Log In</Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-psyplex hover:bg-psyplex-dark">Sign Up Free</Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button className="md:hidden" onClick={toggleMobileMenu}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white absolute top-full left-0 right-0 shadow-lg animate-fade-in">
            <div className="flex flex-col p-4 space-y-4">
              <Link to="/product" className="text-gray-700 hover:text-psyplex py-2" onClick={toggleMobileMenu}>Product</Link>
              <Link to="/pricing" className="text-gray-700 hover:text-psyplex py-2" onClick={toggleMobileMenu}>Pricing</Link>
              <Link to="/blog" className="text-gray-700 hover:text-psyplex py-2" onClick={toggleMobileMenu}>Blog</Link>
              <Link to="/contact" className="text-gray-700 hover:text-psyplex py-2" onClick={toggleMobileMenu}>Contact</Link>
              <div className="flex flex-col space-y-2 pt-2 border-t">
                <Link to="/login" onClick={toggleMobileMenu}>
                  <Button variant="outline" className="w-full">Log In</Button>
                </Link>
                <Link to="/signup" onClick={toggleMobileMenu}>
                  <Button className="w-full bg-psyplex hover:bg-psyplex-dark">Sign Up Free</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main>
        {/* Hero Section */}
        <section className="pt-28 pb-20 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32 relative overflow-hidden">
          {/* Background Shape */}
          <div className="absolute top-0 right-0 -z-10 w-1/2 h-1/2 bg-psyplex-light rounded-bl-[100px] opacity-50" />
          
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-gray-900">
                  Elevate Your <span className="text-psyplex">Therapy Practice</span> with PsyPlex
                </h1>
                <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                  The all-in-one practice management platform designed by therapists, for therapists. Streamline scheduling, billing, documentation, and client engagement.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link to="/signup">
                    <Button size="lg" className="bg-psyplex hover:bg-psyplex-dark text-white px-8 gap-2">
                      Get Started Free
                      <ArrowRight size={18} />
                    </Button>
                  </Link>
                  <Link to="/product">
                    <Button variant="outline" size="lg">
                      Learn More
                    </Button>
                  </Link>
                </div>
                
                <div className="mt-8 flex items-center justify-center lg:justify-start">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200"></div>
                    ))}
                  </div>
                  <p className="ml-4 text-sm text-gray-600">Trusted by <span className="font-semibold">2,000+</span> therapists</p>
                </div>
              </div>
              
              <div className="lg:mt-0 hidden lg:block">
                <div className="relative">
                  <div className="absolute -top-6 -left-6 w-20 h-20 bg-psyplex-light rounded-lg z-0 animate-pulse"></div>
                  <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-psyplex-light rounded-full z-0 animate-pulse"></div>
                  
                  <div className="relative z-10 bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-white p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-semibold text-lg">Client Dashboard</h3>
                        <span className="text-xs text-gray-500">PsyPlex Pro</span>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">Upcoming Session</h4>
                              <p className="text-sm text-gray-600">Thursday, May 12 • 2:00 PM</p>
                            </div>
                            <Button variant="outline" size="sm">Join</Button>
                          </div>
                        </div>
                        
                        <div className="border border-gray-100 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">Notes & Progress</h4>
                              <div className="flex mt-2">
                                {[1, 2, 3, 4, 5].map((i) => (
                                  <div 
                                    key={i} 
                                    className={`w-8 h-1 rounded-full mr-1 ${i <= 4 ? 'bg-psyplex' : 'bg-gray-200'}`}
                                  ></div>
                                ))}
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">View</Button>
                          </div>
                        </div>
                        
                        <div className="border border-gray-100 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">Billing</h4>
                              <p className="text-sm text-gray-600">No outstanding invoices</p>
                            </div>
                            <Button variant="ghost" size="sm">Details</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 flex justify-between items-center">
                      <span className="text-sm text-gray-600">Powered by PsyPlex</span>
                      <Button variant="link" className="text-psyplex p-0 h-auto">
                        <ArrowRight size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="section-padding bg-gray-50 py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Benefits That Transform Your Practice
              </h2>
              <p className="text-lg text-gray-700">
                PsyPlex streamlines every aspect of therapy practice management, 
                so you can focus on what matters most—your clients.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div 
                  key={index} 
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 flex flex-col"
                >
                  <div className="h-12 w-12 bg-psyplex-light rounded-lg flex items-center justify-center mb-5">
                    <benefit.icon className="h-6 w-6 text-psyplex" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                  <p className="text-gray-600 flex-grow">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="section-padding bg-white py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How PsyPlex Works
              </h2>
              <p className="text-lg text-gray-700">
                Get your practice up and running with our streamlined platform in four simple steps.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-16 items-center mb-12">
              <div>
                {steps.map((step, index) => (
                  <div key={index} className="mb-12 last:mb-0">
                    <div className="flex">
                      <div className="flex-shrink-0 mr-6">
                        <div className="w-12 h-12 rounded-full bg-psyplex-light flex items-center justify-center text-psyplex font-bold">
                          {step.number}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                        <p className="text-gray-600">{step.description}</p>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="ml-6 pl-6 border-l-2 border-dashed border-gray-200 h-12 my-2"></div>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 p-8 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-2xl font-bold mb-6">Ready to transform your practice?</h3>
                <p className="text-gray-700 mb-8">
                  Join thousands of therapists who have streamlined their practice management with PsyPlex. Our platform is designed to grow with your practice, from solo providers to large group practices.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-psyplex mr-3 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>No credit card required for free plan</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-psyplex mr-3 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>14-day free trial of premium features</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-psyplex mr-3 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>Cancel or change plans anytime</span>
                  </div>
                </div>
                <div className="mt-8">
                  <Link to="/signup">
                    <Button size="lg" className="bg-psyplex hover:bg-psyplex-dark w-full">Get Started Now</Button>
                  </Link>
                  <p className="text-sm text-center mt-4 text-gray-500">
                    No commitment. Start with our free plan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="section-padding bg-psyplex-light py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                What Therapists Are Saying
              </h2>
              <p className="text-lg text-gray-700">
                Trusted by thousands of mental health professionals worldwide
              </p>
            </div>

            <div className="relative max-w-4xl mx-auto">
              <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-psyplex rounded-full opacity-10"></div>
              <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-32 h-32 bg-psyplex rounded-full opacity-10"></div>
              
              <div className="relative bg-white rounded-xl shadow-lg p-8 md:p-12">
                <Quote className="text-psyplex opacity-20 w-16 h-16 absolute top-6 left-6" />
                
                <div className="relative z-10">
                  <p className="text-xl md:text-2xl text-gray-700 italic mb-8">
                    "{testimonials[activeIndex].quote}"
                  </p>
                  
                  <div className="flex items-center">
                    <img 
                      src={testimonials[activeIndex].image} 
                      alt={testimonials[activeIndex].author} 
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h4 className="font-bold text-gray-900">{testimonials[activeIndex].author}</h4>
                      <p className="text-gray-600">{testimonials[activeIndex].title}</p>
                    </div>
                  </div>
                </div>
                
                <div className="absolute bottom-8 right-8 flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={prevTestimonial}
                    className="h-8 w-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Previous testimonial</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={nextTestimonial}
                    className="h-8 w-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Next testimonial</span>
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-center mt-8">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`w-2 h-2 rounded-full mx-1 ${
                      activeIndex === index ? 'bg-psyplex' : 'bg-gray-300'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-50 pt-16 pb-8">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <Link to="/" className="flex items-center gap-2">
                <div className="bg-psyplex rounded-xl w-10 h-10 flex items-center justify-center">
                  <svg width="22" height="22" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6C16.2 6 14.6 6.8 13.5 8C12.3 7.4 11.2 7.1 10 7.1C9.7 7.1 9.4 7.1 9.1 7.2C8.3 10.4 9 14.2 11.1 16.9C12.7 18.9 14.9 20.1 17.1 20.4C17.7 20.5 18.3 20.5 18.9 20.4C21.1 20.1 23.3 18.9 24.9 16.9C27 14.2 27.7 10.4 26.9 7.2C26.6 7.1 26.3 7.1 26 7.1C24.8 7.1 23.7 7.4 22.5 8C21.4 6.8 19.8 6 18 6ZM10 29C12.2 29 14 27.2 14 25C14 22.8 12.2 21 10 21C7.8 21 6 22.8 6 25C6 27.2 7.8 29 10 29ZM18 35C20.2 35 22 33.2 22 31C22 28.8 20.2 27 18 27C15.8 27 14 28.8 14 31C14 33.2 15.8 35 18 35ZM26 29C28.2 29 30 27.2 30 25C30 22.8 28.2 21 26 21C23.8 21 22 22.8 22 25C22 27.2 23.8 29 26 29Z" fill="white"/>
                  </svg>
                </div>
                <span className="text-psyplex font-bold text-xl">PsyPlex</span>
              </Link>
              <p className="text-gray-600 mt-2">Modern therapy practice management software that helps therapists provide better care.</p>
              <div className="flex space-x-4 mt-4">
                <a href="mailto:info@psyplex.com" className="text-gray-600 hover:text-psyplex flex items-center gap-2">
                  <Mail size={18} />
                  <span>info@psyplex.com</span>
                </a>
              </div>
              <div className="flex space-x-4">
                <a href="tel:+15551234567" className="text-gray-600 hover:text-psyplex flex items-center gap-2">
                  <Phone size={18} />
                  <span>+1 (555) 123-4567</span>
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-3">
                <li><Link to="/product" className="text-gray-600 hover:text-psyplex">Features</Link></li>
                <li><Link to="/pricing" className="text-gray-600 hover:text-psyplex">Pricing</Link></li>
                <li><Link to="/product/security" className="text-gray-600 hover:text-psyplex">Security</Link></li>
                <li><Link to="/product/integrations" className="text-gray-600 hover:text-psyplex">Integrations</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-3">
                <li><Link to="/blog" className="text-gray-600 hover:text-psyplex">Blog</Link></li>
                <li><Link to="/resources/guides" className="text-gray-600 hover:text-psyplex">Guides</Link></li>
                <li><Link to="/resources/webinars" className="text-gray-600 hover:text-psyplex">Webinars</Link></li>
                <li><Link to="/resources/help" className="text-gray-600 hover:text-psyplex">Help Center</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-3">
                <li><Link to="/about" className="text-gray-600 hover:text-psyplex">About Us</Link></li>
                <li><Link to="/careers" className="text-gray-600 hover:text-psyplex">Careers</Link></li>
                <li><Link to="/contact" className="text-gray-600 hover:text-psyplex">Contact</Link></li>
                <li><Link to="/legal/privacy" className="text-gray-600 hover:text-psyplex">Privacy Policy</Link></li>
                <li><Link to="/legal/terms" className="text-gray-600 hover:text-psyplex">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm">© {new Date().getFullYear()} PsyPlex. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-600 hover:text-psyplex">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-600 hover:text-psyplex">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-600 hover:text-psyplex">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-600 hover:text-psyplex">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Data
const benefits = [
  {
    title: "HIPAA Compliant Security",
    description: "End-to-end encryption and secure data storage that meets or exceeds all HIPAA requirements.",
    icon: Shield,
  },
  {
    title: "Streamlined Scheduling",
    description: "Automated appointment reminders, online booking, and seamless calendar syncing.",
    icon: Calendar,
  },
  {
    title: "Time-Saving Documentation",
    description: "Template library, voice-to-text notes, and customizable assessment tools.",
    icon: Clock,
  },
  {
    title: "Simplified Billing",
    description: "Insurance verification, claim submission, and payment processing all in one place.",
    icon: CreditCard,
  },
  {
    title: "Enhanced Client Engagement",
    description: "Secure messaging, resource sharing, and homework assignment features.",
    icon: BookOpen,
  },
  {
    title: "Custom Treatment Plans",
    description: "Create personalized, goal-oriented treatment plans with progress tracking.",
    icon: Check,
  },
];

const steps = [
  {
    number: "01",
    title: "Sign up for your free account",
    description: "Create your PsyPlex account and set up your practice profile in minutes. No credit card required to start."
  },
  {
    number: "02",
    title: "Customize your workflow",
    description: "Set up your scheduling preferences, documentation templates, and billing systems to match your practice."
  },
  {
    number: "03",
    title: "Invite clients and colleagues",
    description: "Seamlessly onboard your clients and team members with automated invitations and guided setup."
  },
  { 
    number: "04",
    title: "Start managing your practice smarter",
    description: "Use PsyPlex's integrated tools to handle scheduling, documentation, billing, and client communication all in one place."
  }
];

const testimonials = [
  {
    quote: "PsyPlex has completely transformed my practice. The intuitive interface and integrated tools have cut my administrative time in half, allowing me to focus more on my clients.",
    author: "Dr. Michelle Johnson",
    title: "Clinical Psychologist",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
    quote: "After trying multiple practice management systems, PsyPlex stands out for its comprehensive features and ease of use. The client portal has received overwhelmingly positive feedback from my patients.",
    author: "Mark Thompson, LMFT",
    title: "Marriage & Family Therapist",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
    quote: "The billing features alone have saved me thousands in lost revenue. The insurance verification tool and automated claim submission have dramatically reduced rejected claims and improved my cash flow.",
    author: "Sarah Williams, LPC",
    title: "Mental Health Counselor",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  }
];

export default Index;
