import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Privacy Policy | Stories for Aashi</title>
        <meta name="description" content="Learn how we collect, use, and protect your personal information on our video story platform." />
      </Helmet>
      <Header searchQuery="" onSearchChange={() => {}} onRandomStory={() => {}} />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
            <p className="text-xl text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Information We Collect</CardTitle>
              <CardDescription>
                We collect information you provide directly to us and information we collect automatically.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Account Information</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Email address (for account creation and notifications)</li>
                  <li>Display name (optional profile information)</li>
                  <li>Avatar URL (optional profile picture)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Usage Information</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Videos you've watched and when you watched them</li>
                  <li>Your notification preferences</li>
                  <li>Featured story preferences and history</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How We Use Your Information</CardTitle>
              <CardDescription>
                We use the information we collect to provide and improve our services.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Provide personalized video recommendations</li>
                <li>Track your watch history for a better viewing experience</li>
                <li>Send email notifications about new content (if enabled)</li>
                <li>Maintain and improve our platform</li>
                <li>Respond to your questions and support requests</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Retention</CardTitle>
              <CardDescription>
                How long we keep your information depends on the type of data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Account Data</h3>
                <p className="text-muted-foreground">
                  We keep your account information until you delete your account or request deletion.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Watch History</h3>
                <p className="text-muted-foreground">
                  Watch history is retained until you clear it or delete your account. You can clear your watch history at any time in your account settings.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Notification Records</h3>
                <p className="text-muted-foreground">
                  Email notification records are kept for up to 2 years for operational purposes.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Rights and Choices</CardTitle>
              <CardDescription>
                You have several rights regarding your personal information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Access:</strong> You can view and export all your data through your account settings</li>
                <li><strong>Correction:</strong> You can update your profile information at any time</li>
                <li><strong>Deletion:</strong> You can delete your account and all associated data</li>
                <li><strong>Portability:</strong> You can export your data in JSON format</li>
                <li><strong>Notification Control:</strong> You can opt out of email notifications</li>
                <li><strong>History Management:</strong> You can clear your watch history at any time</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Security</CardTitle>
              <CardDescription>
                We take reasonable measures to protect your information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We use industry-standard security measures including encryption in transit and at rest, 
                secure authentication through Supabase, and regular security updates. However, no method 
                of transmission over the internet is 100% secure.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Third-Party Services</CardTitle>
              <CardDescription>
                We use trusted third-party services to operate our platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Supabase</h3>
                <p className="text-muted-foreground">
                  We use Supabase for database hosting, authentication, and backend services. 
                  Supabase complies with GDPR and other privacy regulations.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">YouTube</h3>
                <p className="text-muted-foreground">
                  Video content is hosted on YouTube. When you watch videos, YouTube's privacy policy applies.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Resend</h3>
                <p className="text-muted-foreground">
                  We use Resend for sending email notifications. Resend processes email addresses only for delivery purposes.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>International Users</CardTitle>
              <CardDescription>
                Information for users outside the United States.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Our services are hosted in the United States. If you are accessing our services from outside 
                the United States, please be aware that your information may be transferred to, stored, and 
                processed in the United States. We comply with applicable international privacy laws including GDPR for EU users.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Children's Privacy</CardTitle>
              <CardDescription>
                Our policy regarding users under 13 years of age.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Our services are not intended for children under 13 years of age. We do not knowingly collect 
                personal information from children under 13. If you are a parent or guardian and believe your 
                child has provided us with personal information, please contact us.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Changes to This Policy</CardTitle>
              <CardDescription>
                How we handle updates to our privacy policy.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We may update this privacy policy from time to time. We will notify you of any changes by 
                posting the new policy on this page and updating the "Last updated" date. Continued use of 
                our services after changes become effective constitutes acceptance of the new policy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
              <CardDescription>
                How to reach us with privacy-related questions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                If you have any questions about this privacy policy or our data practices, or if you would like 
                to exercise your rights regarding your personal information, please contact us through your account settings 
                or reach out to our support team.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;