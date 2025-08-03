import React from 'npm:react@18.3.1';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22';

interface AccountDeletionEmailProps {
  reactivationUrl: string;
  deletionDate: string;
}

export const AccountDeletionEmail = ({
  reactivationUrl,
  deletionDate,
}: AccountDeletionEmailProps) => (
  <Html>
    <Head />
    <Preview>Your account deletion has been scheduled</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Account Deletion Scheduled</Heading>
        <Text style={text}>
          We've received your request to delete your account. Your account is scheduled 
          to be permanently deleted on <strong>{deletionDate}</strong>.
        </Text>
        <Text style={text}>
          <strong>Changed your mind?</strong> You can reactivate your account at any time 
          before the deletion date by clicking the link below:
        </Text>
        <Link
          href={reactivationUrl}
          target="_blank"
          style={{
            ...link,
            display: 'block',
            marginBottom: '16px',
            padding: '12px 24px',
            backgroundColor: '#2563eb',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            textAlign: 'center' as const,
          }}
        >
          Reactivate My Account
        </Link>
        <Text style={text}>
          Or copy and paste this link into your browser:
        </Text>
        <Text style={code}>{reactivationUrl}</Text>
        <Text style={text}>
          <strong>What happens next?</strong>
        </Text>
        <Text style={text}>
          • Your account is currently inactive and you cannot sign in<br/>
          • All your data remains safe until the deletion date<br/>
          • On {deletionDate}, your account and all data will be permanently deleted<br/>
          • You can reactivate anytime before then using the link above
        </Text>
        <Text
          style={{
            ...text,
            color: '#6b7280',
            marginTop: '32px',
            borderTop: '1px solid #e5e7eb',
            paddingTop: '16px',
          }}
        >
          If you didn't request this deletion, please reactivate your account immediately 
          and contact our support team.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default AccountDeletionEmail;

const main = {
  backgroundColor: '#f9fafb',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '560px',
};

const h1 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 40px',
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
  padding: '0 40px',
};

const link = {
  color: '#2563eb',
  fontSize: '16px',
  textDecoration: 'underline',
};

const code = {
  backgroundColor: '#f3f4f6',
  border: '1px solid #e5e7eb',
  borderRadius: '4px',
  color: '#374151',
  fontSize: '14px',
  padding: '16px',
  margin: '0 40px',
  wordBreak: 'break-all' as const,
};