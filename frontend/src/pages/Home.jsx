import React, { useEffect, useState } from 'react'
import { Overlay } from '../components/Overlay';
import { useNavigate } from 'react-router-dom';

export const Home = () => {
  const nav = useNavigate();
  useEffect(() => {
    nav("/auth");
  }, [])
  return (
    <>Home</>
  )
}