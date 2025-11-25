import React, { useContext } from "react"
import dynamic from "next/dynamic"
import Drawer from "rc-drawer"
import "rc-drawer/assets/index.css"

import Cart from "@component/cart/Cart"
import { SidebarContext } from "@context/SidebarContext"

const CartDrawer = () => {
  const { cartDrawerOpen, closeCartDrawer } = useContext(SidebarContext)

  return (
    <Drawer
      open={cartDrawerOpen}
      onClose={closeCartDrawer}
      placement="right"
      level={null}
      handler={false}
      width={420}
      duration={0.22}
    >
      <div className="h-full w-full bg-white">
        <Cart />
      </div>
    </Drawer>
  )
}

export default dynamic(() => Promise.resolve(CartDrawer), { ssr: false })
