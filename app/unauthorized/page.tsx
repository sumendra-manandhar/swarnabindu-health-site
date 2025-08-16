import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            पहुँच निषेध
          </CardTitle>
          <CardDescription className="text-gray-600">
            तपाईंलाई यो पृष्ठ हेर्ने अनुमति छैन।
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-6">
            यो पृष्ठ केवल प्रशासकहरूका लागि मात्र उपलब्ध छ। यदि तपाईंलाई लाग्छ
            कि यो गल्ती हो भने, कृपया आफ्नो प्रशासकसँग सम्पर्क गर्नुहोस्।
          </p>
          <Button asChild>
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              गृहपृष्ठमा फर्कनुहोस्
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
