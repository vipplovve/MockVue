import { useState } from 'react'
import Card  from '../components/Card'
import Progress  from '../components/Progress'
import ScrollArea from '../components/ScrollArea'
import { ChevronDown, ChevronUp, FileText, Info } from 'lucide-react'

const sampleResumeData = {
  total_score: 71,
  breakdown: {
    education: {
      score: 8,
      summary: 'Good education section, but could be more detailed.',
      comments: ['Add more details about relevant coursework', "Include GPA if it's above 3.5"]
    },
    work_experience: {
      score: 18,
      summary: 'Work experience is well structured but lacks measurable achievements.',
      comments: [
        'Add more quantifiable achievements',
        'Use action verbs to start bullet points',
        'Include technologies used in each role'
      ]
    },
    projects: {
      score: 12,
      summary: 'Projects section is strong but could be better aligned with job targets.',
      comments: [
        'Highlight the most relevant projects for the target role',
        'Add more technical details about your contribution'
      ]
    },
    skills: {
      score: 11,
      summary: 'Good range of skills, but organization could be improved.',
      comments: [
        'Group skills by category (languages, frameworks, tools)',
        'Prioritize skills most relevant to target positions'
      ]
    },
    measurable_metrics: {
      score: 6,
      summary: 'More quantifiable achievements needed throughout.',
      comments: [
        'Add metrics to demonstrate impact in work experience',
        'Quantify project outcomes where possible'
      ]
    },
    formatting: {
      score: 7,
      summary: 'Overall formatting is clean but some improvements needed.',
      comments: [
        'Ensure consistent spacing between sections',
        'Use a more readable font size for body text'
      ]
    },
    keywords_ats: {
      score: 6,
      summary: 'Could use more industry-specific keywords for ATS optimization.',
      comments: [
        'Add more keywords from the job descriptions',
        'Include technical terms relevant to your field'
      ]
    },
    contact_info: {
      score: 3,
      summary: 'Contact information is mostly complete.',
      comments: [
        'Add LinkedIn profile if available',
        'Consider adding a professional portfolio link'
      ]
    }
  },
  overall_comment:
    "Your resume does well in some areas, but it falls short in others which are important to hiring managers and resume screeners. But don't worry - we'll show you how to make easy improvements to your resume, which will increase your score by 20+ points."
}

function ResumeReview() {
  const [activeSection, setActiveSection] = useState('education')
  const [expandedSections, setExpandedSections] = useState({
    education: true,
    work_experience: false,
    projects: false,
    skills: false,
    measurable_metrics: false,
    formatting: false,
    keywords_ats: false,
    contact_info: false
  })

  const resumeData = sampleResumeData

  const sectionWeights = {
    education: 10,
    work_experience: 25,
    projects: 15,
    skills: 15,
    measurable_metrics: 10,
    formatting: 10,
    keywords_ats: 10,
    contact_info: 5
  }

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }))
    setActiveSection(section)
  }

  const formatSectionName = (name) => {
    return name
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div className="text-white bg-gray-800 bg-gradient-to-b from-gray-900 via-black to-black p-10 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_1fr] gap-6">
        {/* Left Column - Score Overview */}
        <div className="space-y-6">
          <Card className="p-6 flex flex-col items-center">
            <div className="relative w-32 h-32 rounded-full border-8 border-gray-100 flex items-center justify-center mb-4">
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-green-500"
                  style={{ height: `${resumeData.total_score}%` }}
                ></div>
              </div>
              <span className="text-4xl font-bold relative z-10">{resumeData.total_score}</span>
            </div>
            <h2 className="text-xl font-bold">Overall Score</h2>
            <p className="text-sm text-gray-300 text-center mt-2">out of 100 points</p>
          </Card>

          <Card className="p-4">
            <h3 className="font-medium mb-4">Scoring Breakdown</h3>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {Object.entries(resumeData.breakdown).map(([section, data]) => (
                  <div key={section} className="space-y-2">
                    <div
                      className={`flex justify-between items-center cursor-pointer ${
                        activeSection === section ? 'text-blue-600 font-medium' : ''
                      }`}
                      onClick={() => toggleSection(section)}
                    >
                      <div className="flex items-center gap-2">
                        {expandedSections[section] ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                        <span>{formatSectionName(section)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {data.score}/{sectionWeights[section]}
                        </span>
                      </div>
                    </div>
                    <Progress
                      value={(data.score / sectionWeights[section]) * 100}
                      className="h-2"
                    />

                    {expandedSections[section] && (
                      <div className="pl-6 pt-2 text-sm text-gray-300">
                        <p>{data.summary}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>

        {/* Middle Column - Detailed Feedback */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Detailed Feedback</h2>
          <div className="mb-6">
            <h3 className="font-medium text-lg">{formatSectionName(activeSection)}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Progress
                value={
                  (resumeData.breakdown[activeSection].score / sectionWeights[activeSection]) * 100
                }
                className="h-2 flex-1"
              />
              <span className="text-sm font-medium">
                {resumeData.breakdown[activeSection].score}/{sectionWeights[activeSection]}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <Info size={16} />
                Summary
              </h4>
              <p className="text-gray-300">{resumeData.breakdown[activeSection].summary}</p>
            </div>

            <div>
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <FileText size={16} />
                Improvement Suggestions
              </h4>
              <ul className="list-disc pl-5 space-y-2 text-gray-300">
                {resumeData.breakdown[activeSection].comments.map((comment, index) => (
                  <li key={index}>{comment}</li>
                ))}
              </ul>
            </div>

            {activeSection === 'education' && (
              <div className="bg-blue-50 p-4 rounded-md mt-4">
                <h4 className="font-medium text-blue-700 mb-2">Pro Tip</h4>
                <p className="text-blue-700 text-sm">
                  For education, focus on relevant coursework and academic achievements that align
                  with your target role. If you're a recent graduate, your education should be more
                  detailed than if you have extensive work experience.
                </p>
              </div>
            )}

            {activeSection === 'work_experience' && (
              <div className="bg-blue-50 p-4 rounded-md mt-4">
                <h4 className="font-medium text-blue-700 mb-2">Pro Tip</h4>
                <p className="text-blue-700 text-sm">
                  Use the STAR method (Situation, Task, Action, Result) to structure your work
                  achievements. Quantify your impact whenever possible with metrics and percentages.
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t">
            <h3 className="font-medium mb-3">Overall Assessment</h3>
            <p className="text-gray-300">{resumeData.overall_comment}</p>
          </div>
        </Card>

        {/* Right Column - Resume Preview */}
        <Card className="p-4">
          <h2 className="text-xl font-bold mb-4">Resume Preview</h2>
          <div className="bg-gray-100 rounded-md overflow-hidden">
            <div className="relative h-[600px] w-full">
              <img
                src=""
                alt="Resume preview"
                className="object-contain w-full h-full"
              />
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-200">
              Click on sections in the left panel to see specific feedback
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default ResumeReview
