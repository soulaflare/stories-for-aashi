import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Terms of Service | Stories for Aashi</title>
        <meta name="description" content="Terms of service governing the use of our video story platform." />
      </Helmet>
      <Header searchQuery="" onSearchChange={() => {}} onRandomStory={() => {}} onSync={() => {}} />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
            <p className="text-xl text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Acceptance of Terms</CardTitle>
              <CardDescription>
                By accessing and using our service, you accept and agree to be bound by these terms.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                By accessing and using Stories for Aashi ("the Service"), you accept and agree to be bound by 
                the terms and provision of this agreement. If you do not agree to abide by the above, please 
                do not use this service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Description of Service</CardTitle>
              <CardDescription>
                What our platform provides and how it works.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Stories for Aashi is a curated collection of video stories designed primarily for children's 
                entertainment and education. Our service provides:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Access to a curated library of video stories</li>
                <li>User accounts for tracking watch history</li>
                <li>Email notifications for new content (optional)</li>
                <li>Personalized story recommendations</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Accounts and Responsibilities</CardTitle>
              <CardDescription>
                Your obligations as a user of our service.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Account Creation</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>You must provide accurate and complete information when creating an account</li>
                  <li>You are responsible for maintaining the security of your account credentials</li>
                  <li>You must notify us immediately of any unauthorized access to your account</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Acceptable Use</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Use the service only for lawful purposes</li>
                  <li>Do not attempt to reverse engineer or compromise our systems</li>
                  <li>Do not share account credentials with others</li>
                  <li>Do not use automated systems to access our service without permission</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content and Intellectual Property</CardTitle>
              <CardDescription>
                Rights and ownership of content on our platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Video Content</h3>
                <p className="text-muted-foreground">
                  Video content is hosted on YouTube and subject to YouTube's terms of service. We curate 
                  and provide access to this content but do not own the underlying video materials unless 
                  specifically noted.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Platform Content</h3>
                <p className="text-muted-foreground">
                  Our platform design, curation, organization, and presentation of content is proprietary 
                  and protected by intellectual property laws.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacy and Data</CardTitle>
              <CardDescription>
                How your information is handled (see our Privacy Policy for details).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Your privacy is important to us. Please review our{' '}
                <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>{' '}
                to understand how we collect, use, and protect your information. By using our service, 
                you consent to the collection and use of information as outlined in our Privacy Policy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Service Availability</CardTitle>
              <CardDescription>
                Disclaimers about service uptime and availability.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We strive to maintain high availability of our service, but we do not guarantee uninterrupted 
                access. The service may be temporarily unavailable due to maintenance, updates, or technical issues. 
                We reserve the right to modify or discontinue the service at any time with reasonable notice.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Limitation of Liability</CardTitle>
              <CardDescription>
                Important disclaimers about our liability.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                To the fullest extent permitted by law, Stories for Aashi shall not be liable for any indirect, 
                incidental, special, consequential, or punitive damages, or any loss of profits or revenues, 
                whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
              </p>
              <p className="text-muted-foreground">
                Our total liability to you for any claims arising from these terms or your use of the service 
                shall not exceed the amount you paid us in the twelve months preceding the claim.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Termination</CardTitle>
              <CardDescription>
                Conditions under which accounts may be terminated.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Termination by You</h3>
                <p className="text-muted-foreground">
                  You may delete your account at any time through your account settings. Upon deletion, 
                  your personal data will be permanently removed as outlined in our Privacy Policy.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Termination by Us</h3>
                <p className="text-muted-foreground">
                  We may suspend or terminate your account if you violate these terms, engage in harmful 
                  activities, or if required by law. We will provide reasonable notice when possible.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dispute Resolution</CardTitle>
              <CardDescription>
                How disputes are handled.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Any disputes arising from these terms or your use of the service will be resolved through 
                binding arbitration in accordance with the rules of the American Arbitration Association. 
                You waive any right to participate in class action lawsuits or class-wide arbitrations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Governing Law</CardTitle>
              <CardDescription>
                Legal jurisdiction for these terms.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                These terms shall be governed by and construed in accordance with the laws of [Your State/Country], 
                without regard to its conflict of law provisions. Any legal action or proceeding shall be brought 
                exclusively in the courts located in [Your Jurisdiction].
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Changes to Terms</CardTitle>
              <CardDescription>
                How we handle updates to these terms.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We reserve the right to modify these terms at any time. We will notify users of material 
                changes by posting the updated terms on this page and updating the "Last updated" date. 
                For significant changes that affect your rights, we may also send email notifications. 
                Continued use of the service after changes become effective constitutes acceptance of the new terms.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                How to reach us with questions about these terms.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                If you have any questions about these Terms of Service, please contact us through your 
                account settings or reach out to our support team. We will respond to your inquiries in a timely manner.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TermsOfService;