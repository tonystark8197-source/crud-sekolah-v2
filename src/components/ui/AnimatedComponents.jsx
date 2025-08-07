import React from 'react';

// Fade In Animation - No Animation (Direct Display)
export const FadeIn = ({
  children,
  delay = 0,
  duration = 0.5,
  direction = 'up',
  distance = 20,
  className = '',
  ...props
}) => {
  return (
    <div
      className={className}
      {...props}
    >
      {children}
    </div>
  );
};

// Slide In Animation - No Animation (Direct Display)
export const SlideIn = ({
  children,
  direction = 'left',
  delay = 0,
  duration = 0.6,
  distance = 100,
  className = '',
  ...props
}) => {
  return (
    <div
      className={className}
      {...props}
    >
      {children}
    </div>
  );
};

// Scale Animation - No Animation (Direct Display)
export const ScaleIn = ({
  children,
  delay = 0,
  duration = 0.4,
  scale = 0.8,
  className = '',
  ...props
}) => {
  return (
    <div
      className={className}
      {...props}
    >
      {children}
    </div>
  );
};

// Stagger Children Animation - No Animation (Direct Display)
export const StaggerContainer = ({
  children,
  staggerDelay = 0.1,
  className = '',
  ...props
}) => {
  return (
    <div
      className={className}
      {...props}
    >
      {children}
    </div>
  );
};

// Stagger Item - No Animation (Direct Display)
export const StaggerItem = ({
  children,
  direction = 'up',
  distance = 20,
  className = '',
  ...props
}) => {
  return (
    <div
      className={className}
      {...props}
    >
      {children}
    </div>
  );
};

// Stagger Table Row - No Animation (Direct Display)
export const StaggerTableRow = ({
  children,
  direction = 'up',
  distance = 20,
  className = '',
  ...props
}) => {
  return (
    <tr
      className={className}
      {...props}
    >
      {children}
    </tr>
  );
};

// Hover Scale Animation - No Animation (Direct Display)
export const HoverScale = ({
  children,
  scale = 1.05,
  duration = 0.2,
  className = '',
  ...props
}) => {
  return (
    <div
      className={className}
      {...props}
    >
      {children}
    </div>
  );
};

// Bounce Animation - No Animation (Direct Display)
export const Bounce = ({
  children,
  delay = 0,
  className = '',
  ...props
}) => {
  return (
    <div
      className={className}
      {...props}
    >
      {children}
    </div>
  );
};

// Rotate Animation - No Animation (Direct Display)
export const RotateIn = ({
  children,
  delay = 0,
  duration = 0.6,
  rotation = 180,
  className = '',
  ...props
}) => {
  return (
    <div
      className={className}
      {...props}
    >
      {children}
    </div>
  );
};

// Page Transition - No Animation (Direct Display)
export const PageTransition = ({ children, className = '', ...props }) => {
  return (
    <div
      className={className}
      {...props}
    >
      {children}
    </div>
  );
};

// Modal Animation - No Animation (Direct Display)
export const ModalAnimation = ({ children, isOpen, className = '', ...props }) => {
  return (
    <>
      {isOpen && (
        <div
          className={className}
          {...props}
        >
          <div>
            {children}
          </div>
        </div>
      )}
    </>
  );
};


