import { CMSPage } from "@/components/cms-page";

export default function RefundPolicyES() {
  return (
    <CMSPage 
      slug="refund-policy-es"
      defaultTitle="Política de Reembolso"
      defaultContent="Queremos que estés completamente satisfecho con tu suscripción, así que aquí tienes todo lo que necesitas saber sobre nuestra política de reembolso."
      showBackButton={true}
      backTo="/pricing"
    />
  );
}