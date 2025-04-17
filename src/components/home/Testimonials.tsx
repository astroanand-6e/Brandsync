"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Marketing Director",
    company: "TechStart Inc",
    image: "/avatars/sarah.jpg",
    content: "BrandSync has transformed how we work with influencers. The platform is intuitive and the results have been outstanding.",
  },
  {
    name: "Michael Chen",
    role: "Founder",
    company: "EcoWear",
    image: "/avatars/michael.jpg",
    content: "The quality of influencers we've connected with through BrandSync is exceptional. It's become an essential tool for our business.",
  },
  {
    name: "Emma Rodriguez",
    role: "Content Creator",
    company: "Self-employed",
    image: "/avatars/emma.jpg",
    content: "As a creator, BrandSync has helped me find amazing brand partnerships that align with my values and audience.",
  },
];

const Testimonials = () => {
  return (
    <section className="py-16 md:py-24 bg-secondary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Our Community Says
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join thousands of satisfied brands and creators who are already experiencing the power of BrandSync.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <Avatar>
                  <AvatarImage src={testimonial.image} alt={testimonial.name} />
                  <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role} at {testimonial.company}
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground">{testimonial.content}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials; 