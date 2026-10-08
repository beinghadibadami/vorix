import {defineType} from 'sanity';
import defaults from '../client/src/content/defaults.json';

const labels: Record<string, string> = {
  copy:'Page text', brand:'Brand name', navigation:'Navigation', hero:'Homepage hero', about:'About the company',
  products:'Product section', process:'Process section', why:'Why Vorix', contact:'Contact details',
  faq:'FAQ page', journal:'Journal cards', footer:'Footer', heroImage:'Homepage hero image', processImage:'Process background image',
  categories:'Product category cards', productDepth:'Product ranges and formats', processSteps:'Eight process steps',
  pillars:'Four quality highlights', faqs:'Questions and answers', seo:'Search engine titles and descriptions',
  short:'Short description', tone:'Card colour', visual:'Image frame style', path:'Original website image',
  alt:'Image description (accessibility)', domesticEmail:'Domestic enquiry email', exportEmail:'Export enquiry email',
  instagramUrl:'Instagram link', instagramLabel:'Instagram display label', items:'Product formats', detail:'Range description',
};
const groups: Record<string,string> = {copy:'text', heroImage:'images',processImage:'images',navigation:'settings',contact:'settings',categories:'products',productDepth:'products',processSteps:'process',pillars:'process',faqs:'faq',journal:'journal',seo:'seo'};
const title = (key:string) => labels[key] ?? key.replace(/([a-z])([A-Z])/g,'$1 $2').replace(/^./,c=>c.toUpperCase());
const fixedCounts:Record<string,number> = {navigation:3,processSteps:8,pillars:4};
const designOptions:Record<string,string[]> = {tone:['saffron','rose','wine','cream','amber','sage'],visual:['rings','petals','red-rings','cloves','crunch','spices']};

// The schema follows the same defaults used by the frontend. Every existing text
// and image has an editor, and the site can validate published content against it.
function field(name:string, value:unknown, path=name): any {
  const common = {name, title:title(name)};
  if (Array.isArray(value)) {
    const member = typeof value[0] === 'string' ? {type:'string'} : {
      type:'object', name:`${name}Item`, fields:Object.entries(value[0]).filter(([key])=>key!=='_key').map(([key,v])=>field(key,v,`${path}.*.${key}`)),
      preview:{select:{title: name==='faqs'?'question':name==='navigation'?'label':name==='journal'||name==='pillars'?'title':'name'}},
    };
    return {...common,type:'array',of:[member],description:fixedCounts[name] ? `Keep ${fixedCounts[name]} items to preserve the current layout. Text and order can be edited.` : undefined,
      validation:(rule:any)=>fixedCounts[name] ? rule.required().length(fixedCounts[name]) : ['faqs','journal'].includes(name) ? rule : rule.required().min(1)};
  }
  if(value && typeof value==='object') {
    if('path' in value && 'alt' in value) return {...common,type:'object',options:{collapsible:true,collapsed:false},fields:[
      {name:'upload',title:'Replace image',type:'image',description:'Upload a replacement here. Leave empty to keep the original image. The website keeps its existing image frame.'},
      {name:'path',title:'Original image path',type:'string',initialValue:value.path,readOnly:true,description:'The existing image stays in the website. Removing a replacement restores this original.'},
      {name:'alt',title:'Image description',type:'string',initialValue:value.alt,description:'Describe meaningful images briefly; leave blank for decorative images.'},
    ]};
    return {...common,type:'object',options:{collapsible:true,collapsed:path!=='copy'},fields:Object.entries(value).filter(([key])=>key!=='_key').map(([key,v])=>field(key,v,`${path}.${key}`))};
  }
  const text=String(value);
  const copyField=path.startsWith('copy.');
  const fieldTitle=copyField ? text.trim().slice(0,75)+(text.trim().length>75?'…':'') : common.title;
  return {...common,title:fieldTitle || common.title,type:text.length>100||name==='answer'||name==='description'||name==='copy'?'text':'string',
    ...(text.length>100?{rows:3}:{}),
    ...(designOptions[name]?{options:{list:designOptions[name].map(v=>({title:title(v),value:v}))}}:{}),
    ...(copyField?{description:'Edit the wording; line breaks, emphasis and styling stay as designed.'}:{}),
    validation:(rule:any)=> {
      let result=rule.required().max(20000);
      if(['domesticEmail','exportEmail'].includes(name)) result=result.email();
      if(name==='href'||name==='instagramUrl') result=result.custom((v:string)=>!v||/^\/(?!\/)[^\\\s]*$/.test(v)||/^https:\/\/[^\s]+$/.test(v)||'Use a website path starting with / or a full https:// URL.');
      if(name==='phone') result=result.regex(/^\+?[\d\s().-]{5,30}$/,{name:'phone number'});
      return result;
    }};
}

export const websiteContent = defineType({
  name:'websiteContent',title:'Vorix website',type:'document',
  groups:[{name:'text',title:'Page text',default:true},{name:'images',title:'Hero & background images'},{name:'products',title:'Products'},{name:'process',title:'Process & quality'},{name:'faq',title:'FAQs'},{name:'journal',title:'Journal'},{name:'settings',title:'Contact & navigation'},{name:'seo',title:'SEO'}],
  fields:Object.entries(defaults).map(([key,value])=>({...field(key,value),group:groups[key]})),
  preview:{prepare:()=>({title:'Vorix website',subtitle:'Edit content, then Publish to update the website'})},
});
