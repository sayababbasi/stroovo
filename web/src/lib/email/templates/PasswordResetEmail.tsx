import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from '@react-email/components';
import * as React from 'react';

interface PasswordResetEmailProps {
  userName: string;
  resetUrl: string;
}

export const PasswordResetEmail = ({
  userName,
  resetUrl,
}: PasswordResetEmailProps) => {
  const previewText = `Reset your Stroovo password`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Section className="mt-[32px]">
              <div className="flex justify-center items-center h-12 w-12 bg-blue-600 rounded-lg mx-auto">
                <Text className="text-white text-2xl font-bold m-0">S</Text>
              </div>
            </Section>
            
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Reset Your Password
            </Heading>
            
            <Text className="text-black text-[14px] leading-[24px]">
              Hello {userName},
            </Text>
            
            <Text className="text-black text-[14px] leading-[24px]">
              We received a request to reset the password for your Stroovo account. 
              Click the button below to set a new password. This link will expire in 1 hour.
            </Text>
            
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#2563eb] rounded text-white text-[14px] font-bold no-underline text-center px-6 py-3"
                href={resetUrl}
              >
                Reset Password
              </Button>
            </Section>
            
            <Text className="text-black text-[14px] leading-[24px]">
              or copy and paste this URL into your browser:{' '}
              <Link href={resetUrl} className="text-blue-600 no-underline">
                {resetUrl}
              </Link>
            </Text>
            
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              If you didn't request a password reset, you can safely ignore this email. 
              Your password will remain unchanged.
            </Text>
            
            <Text className="text-[#666666] text-[12px] leading-[24px] text-center mt-4">
              © {new Date().getFullYear()} Stroovo Enterprise Platform. All rights reserved.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default PasswordResetEmail;
