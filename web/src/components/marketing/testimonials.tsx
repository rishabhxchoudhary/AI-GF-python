export function TestimonialsSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">What Users Say</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="mb-4">
              "Amazing AI companion that really understands me!"
            </p>
            <p className="font-semibold">- Alex</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="mb-4">
              "Best AI relationship experience I've ever had."
            </p>
            <p className="font-semibold">- Jordan</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="mb-4">"Feels so natural and engaging."</p>
            <p className="font-semibold">- Taylor</p>
          </div>
        </div>
      </div>
    </section>
  );
}
