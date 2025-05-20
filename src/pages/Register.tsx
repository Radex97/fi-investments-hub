
import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import TopBar from "@/components/TopBar";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/contexts/LanguageContext";

// Define an interface that matches the resolver's expected type
interface RegisterFormData {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: boolean;
}

const createSchema = (t: any) => yup.object({
  firstName: yup.string().required(t("firstNameRequired")),
  lastName: yup.string().required(t("lastNameRequired")),
  email: yup.string().email(t("invalidEmail")).required(t("emailRequired")),
  password: yup.string().min(8, t("passwordMinLength")).required(t("passwordRequired")),
  confirmPassword: yup.string().oneOf([yup.ref("password"), null], t("passwordsMustMatch")).required(t("confirmPasswordRequired")),
  terms: yup.boolean().oneOf([true], t("mustAcceptTerms")),
}).required();

// Make sure all properties are required in the FormData type to match the schema
type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
};

const Register = () => {
  const { registerUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const schema = createSchema(t);
  
  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: yupResolver<RegisterFormData>(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      // Type assertion here since we know at this point all fields are validated and present
      await registerUser(
        data.email as string, 
        data.password as string, 
        data.firstName as string, 
        data.lastName as string
      );
      toast({
        title: t("registrationSuccessful"),
        description: t("checkEmailConfirmation"),
      });
      navigate("/email-confirmation");
    } catch (error: any) {
      console.error("Registration failed:", error);
      toast({
        title: t("registrationFailed"),
        description: error.message || t("registrationErrorOccurred"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pt-14">
      <TopBar showBackButton={true} />
      
      <div className="container mx-auto p-4 md:p-8 max-w-md">
        <div className="bg-white shadow-md rounded-lg p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">{t("createAccount")}</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="firstName">{t("firstName")}</Label>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <Input id="firstName" type="text" {...field} placeholder={t("enterFirstName")} />
                )}
              />
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <Label htmlFor="lastName">{t("lastName")}</Label>
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <Input id="lastName" type="text" {...field} placeholder={t("enterLastName")} />
                )}
              />
              {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
            </div>
            <div>
              <Label htmlFor="email">{t("email")}</Label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input id="email" type="email" {...field} placeholder={t("enterEmail")} />
                )}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="password">{t("password")}</Label>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Input id="password" type="password" {...field} placeholder={t("enterPassword")} />
                )}
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <Input id="confirmPassword" type="password" {...field} placeholder={t("confirmYourPassword")} />
                )}
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
            </div>
            <div className="flex items-center space-x-2">
              <Controller
                name="terms"
                control={control}
                render={({ field }) => (
                  <Checkbox 
                    id="terms" 
                    checked={field.value} 
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="terms" className="text-sm">
                {t("agreeToTerms")} <Link to="/agb" className="text-blue-500 hover:underline">{t("termsAndConditions")}</Link>
              </Label>
              {errors.terms && <p className="text-red-500 text-sm">{errors.terms.message}</p>}
            </div>
            <Button disabled={loading} type="submit" className="w-full">
              {loading ? t("creatingAccount") : t("createAccount")}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              {t("alreadyHaveAccount")} <Link to="/login" className="text-blue-500 hover:underline">{t("login")}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
