// freshmart-frontend/src/pages/order/[id].js
import { PDFDownloadLink } from "@react-pdf/renderer";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { IoCloudDownloadOutline, IoPrintOutline } from "react-icons/io5";
import { useReactToPrint } from "react-to-print";

// internal import
import Layout from "@layout/Layout";
import useGetSetting from "@hooks/useGetSetting";
import Invoice from "@component/invoice/Invoice";
import Loading from "@component/preloader/Loading";
import { UserContext } from "@context/UserContext";
import OrderServices from "@services/OrderServices";
import useUtilsFunction from "@hooks/useUtilsFunction";
import InvoiceForDownload from "@component/invoice/InvoiceForDownload";

const Order = ({ params }) => {
  const printRef = useRef(null);
  const router = useRouter();

  const orderId = useMemo(() => params?.id, [params]);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const {
    state: { userInfo },
  } = useContext(UserContext);

  const { showingTranslateValue, getNumberTwo } = useUtilsFunction();
  const { storeCustomizationSetting, globalSetting } = useGetSetting();

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: "Invoice",
  });

  useEffect(() => {
    if (!userInfo) {
      router.replace("/");
      return;
    }

    if (!orderId) return;

    let alive = true;

    (async () => {
      try {
        setLoading(true);
        const res = await OrderServices.getOrderById(orderId);

        if (!alive) return;

        // if your httpServices returns axios response, keep the fallback
        const payload = res?.data ? res.data : res;

        setData(payload);
        setLoading(false);
      } catch (err) {
        if (!alive) return;
        setLoading(false);
        console.log("order fetch error:", err?.response?.data || err?.message || err);
      }
    })();

    return () => {
      alive = false;
    };
  }, [orderId, userInfo, router]);

  return (
    <Layout title="Invoice" description="order confirmation page">
      {loading ? (
        <Loading loading={loading} />
      ) : (
        <div className="max-w-screen-2xl mx-auto py-10 px-3 sm:px-6">
          <div className="bg-emerald-100 rounded-md mb-5 px-4 py-3">
            <label>
              {showingTranslateValue(
                storeCustomizationSetting?.dashboard?.invoice_message_first
              )}{" "}
              <span className="font-bold text-emerald-600">{data?.user_info?.name},</span>{" "}
              {showingTranslateValue(
                storeCustomizationSetting?.dashboard?.invoice_message_last
              )}
            </label>
          </div>

          <div className="bg-white rounded-lg shadow-sm">
            <Invoice
              data={data}
              printRef={printRef}
              globalSetting={globalSetting}
              currency={globalSetting?.default_currency || "$"}
            />

            <div className="bg-white p-8 rounded-b-xl">
              <div className="flex lg:flex-row md:flex-row sm:flex-row flex-col justify-between invoice-btn">
                <PDFDownloadLink
                  document={
                    <InvoiceForDownload
                      data={data}
                      globalSetting={globalSetting}
                      getNumberTwo={getNumberTwo}
                      currency={globalSetting?.default_currency || "$"}
                    />
                  }
                  fileName="Invoice"
                >
                  {({ loading: pdfLoading }) =>
                    pdfLoading ? (
                      "Loading..."
                    ) : (
                      <button
                        type="button"
                        className="mb-3 sm:mb-0 md:mb-0 lg:mb-0 flex items-center justify-center bg-emerald-500 text-white transition-all font-serif text-sm font-semibold h-10 py-2 px-5 rounded-md"
                      >
                        {showingTranslateValue(
                          storeCustomizationSetting?.dashboard?.download_button
                        )}{" "}
                        <span className="ml-2 text-base">
                          <IoCloudDownloadOutline />
                        </span>
                      </button>
                    )
                  }
                </PDFDownloadLink>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="mb-3 sm:mb-0 md:mb-0 lg:mb-0 flex items-center justify-center bg-emerald-500 text-white transition-all font-serif text-sm font-semibold h-10 py-2 px-5 rounded-md"
                >
                  {showingTranslateValue(storeCustomizationSetting?.dashboard?.print_button)}{" "}
                  <span className="ml-2">
                    <IoPrintOutline />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export const getServerSideProps = ({ params }) => {
  return { props: { params } };
};

export default dynamic(() => Promise.resolve(Order), { ssr: false });
