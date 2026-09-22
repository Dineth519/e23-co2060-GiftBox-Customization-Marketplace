with open('code/frontend/src/pages/customer/BoxBuilderPage.jsx', 'r') as f:
    content = f.read()

step5_jsx = """
            {/* STEP 5: CHECKOUT & DISPATCH */}
            {activeStep === 5 && (
              <div className="bb-step-view">
                <div className="bb-step-header">
                  <h3>Checkout & Dispatch</h3>
                  <p>Provide consignment address and secure payment details.</p>
                </div>

                <div className="bb-form-layout">
                  <div className="bb-field">
                    <label>Delivery Destination Address *</label>
                    <input
                      type="text"
                      placeholder="Street, City, Zip / Postal Code"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                    />
                  </div>

                  <div className="bb-field-row">
                    <div className="bb-field">
                      <label>Preferred Delivery Date</label>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {clientSecret ? (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm 
                      grandTotal={grandTotal} 
                      onPaymentSuccess={handlePlaceOrder} 
                      onBack={() => setActiveStep(4)} 
                      submitting={submitting} 
                    />
                  </Elements>
                ) : (
                  <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading secure checkout...
                  </div>
                )}
              </div>
            )}
"""

target = "              {/* RIGHT LIVE PREVIEW & LEDGER PANEL */}"
content = content.replace(target, step5_jsx + "\n" + target)

with open('code/frontend/src/pages/customer/BoxBuilderPage.jsx', 'w') as f:
    f.write(content)
